package storage

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/logger"
	"github.com/yourorg/cnc-edge/internal/models"
	"go.uber.org/zap"
)

// PostgresStore mengelola data alarm di PostgreSQL
type PostgresStore struct {
	db *sql.DB
}

// NewPostgres membuat koneksi dan menginisialisasi schema database alarm
func NewPostgres(cfg config.PostgresConfig) (*PostgresStore, error) {
	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("buka PostgreSQL gagal: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("PostgreSQL tidak bisa diping: %w", err)
	}

	store := &PostgresStore{db: db}
	if err := store.migrate(ctx); err != nil {
		return nil, fmt.Errorf("migrasi schema gagal: %w", err)
	}

	logger.Info("PostgreSQL terhubung", zap.String("dbname", cfg.DBName))
	return store, nil
}

// migrate membuat tabel jika belum ada
func (p *PostgresStore) migrate(ctx context.Context) error {
	schema := `
	CREATE TABLE IF NOT EXISTS alarm_events (
		id           BIGSERIAL PRIMARY KEY,
		machine_id   VARCHAR(50)  NOT NULL,
		machine_name VARCHAR(100) NOT NULL,
		timestamp    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
		resolved_at  TIMESTAMPTZ,
		code         INTEGER      NOT NULL DEFAULT 0,
		message      TEXT         NOT NULL,
		severity     VARCHAR(20)  NOT NULL DEFAULT 'info',
		type         VARCHAR(50)  NOT NULL DEFAULT 'system',
		axis         VARCHAR(10)
	);
	CREATE INDEX IF NOT EXISTS idx_alarm_machine_id   ON alarm_events(machine_id);
	CREATE INDEX IF NOT EXISTS idx_alarm_timestamp    ON alarm_events(timestamp DESC);
	CREATE INDEX IF NOT EXISTS idx_alarm_severity     ON alarm_events(severity);
	CREATE INDEX IF NOT EXISTS idx_alarm_resolved     ON alarm_events(resolved_at);

	CREATE TABLE IF NOT EXISTS oee_history (
		id             BIGSERIAL PRIMARY KEY,
		machine_id     VARCHAR(50)  NOT NULL,
		machine_name   VARCHAR(100) NOT NULL,
		period         VARCHAR(20)  NOT NULL,
		calculated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
		availability   NUMERIC(5,2) NOT NULL DEFAULT 0,
		performance    NUMERIC(5,2) NOT NULL DEFAULT 0,
		quality        NUMERIC(5,2) NOT NULL DEFAULT 100,
		oee            NUMERIC(5,2) NOT NULL DEFAULT 0,
		planned_time   NUMERIC(10,2),
		operating_time NUMERIC(10,2),
		cutting_time   NUMERIC(10,2),
		alarm_count    INTEGER      DEFAULT 0
	);
	CREATE INDEX IF NOT EXISTS idx_oee_machine_id ON oee_history(machine_id);
	CREATE INDEX IF NOT EXISTS idx_oee_period     ON oee_history(period, calculated_at DESC);

	CREATE TABLE IF NOT EXISTS production_logs (
		id BIGSERIAL PRIMARY KEY,
		machine_id VARCHAR(50) NOT NULL,
		machine_name VARCHAR(100) NOT NULL,
		work_order VARCHAR(100),
		part_number VARCHAR(100),
		shift INTEGER DEFAULT 1,
		operator_id VARCHAR(100),
		qty_ok INTEGER DEFAULT 0,
		qty_ng INTEGER DEFAULT 0,
		cycle_time_actual NUMERIC(10,3) DEFAULT 0,
		operating_time_min NUMERIC(10,2) DEFAULT 0,
		downtime_min NUMERIC(10,2) DEFAULT 0,
		downtime_category VARCHAR(50),
		oee NUMERIC(5,2) DEFAULT 0,
		availability NUMERIC(5,2) DEFAULT 0,
		performance NUMERIC(5,2) DEFAULT 0,
		quality NUMERIC(5,2) DEFAULT 100,
		timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_production_logs_machine_timestamp ON production_logs(machine_id, timestamp DESC);

	CREATE TABLE IF NOT EXISTS downtime_logs (
		id BIGSERIAL PRIMARY KEY,
		machine_id VARCHAR(50) NOT NULL,
		category VARCHAR(50) NOT NULL,
		reason TEXT,
		started_at TIMESTAMPTZ NOT NULL,
		resolved_at TIMESTAMPTZ,
		action_taken TEXT
	);
	CREATE INDEX IF NOT EXISTS idx_downtime_machine_started ON downtime_logs(machine_id, started_at DESC);

	CREATE TABLE IF NOT EXISTS machine_configs (
		id VARCHAR(50) PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		machine_type VARCHAR(50) NOT NULL,
		protocol VARCHAR(30) NOT NULL DEFAULT 'mqtt',
		location VARCHAR(100),
		connection_config JSONB NOT NULL DEFAULT '{}'::jsonb,
		production_config JSONB NOT NULL DEFAULT '{}'::jsonb,
		mqtt_topics JSONB NOT NULL DEFAULT '{}'::jsonb,
		enabled BOOLEAN DEFAULT true,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS mango_sync_queue (
		id BIGSERIAL PRIMARY KEY,
		event_type VARCHAR(50) NOT NULL,
		endpoint VARCHAR(100) NOT NULL,
		machine_id VARCHAR(50),
		payload JSONB NOT NULL,
		status VARCHAR(20) NOT NULL DEFAULT 'pending',
		attempts INTEGER NOT NULL DEFAULT 0,
		last_error TEXT,
		available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		last_attempt_at TIMESTAMPTZ,
		sent_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_mango_sync_pending ON mango_sync_queue(status, available_at);

	CREATE TABLE IF NOT EXISTS operators (
		id VARCHAR(20) PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		department VARCHAR(50),
		default_shift INTEGER,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS operator_checkins (
		id BIGSERIAL PRIMARY KEY,
		machine_id VARCHAR(50) NOT NULL,
		operator_id VARCHAR(20) REFERENCES operators(id) ON DELETE SET NULL,
		shift INTEGER NOT NULL,
		work_order VARCHAR(50),
		part_number VARCHAR(50),
		target_qty INTEGER,
		checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		checked_out_at TIMESTAMPTZ
	);
	CREATE INDEX IF NOT EXISTS idx_checkin_machine ON operator_checkins(machine_id, checked_in_at DESC);

	CREATE TABLE IF NOT EXISTS mango_work_order_cache (
		id BIGSERIAL PRIMARY KEY,
		snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		payload JSONB NOT NULL
	);

	CREATE TABLE IF NOT EXISTS connection_logs (
		id BIGSERIAL PRIMARY KEY,
		machine_id VARCHAR(50) NOT NULL,
		machine_name VARCHAR(100) NOT NULL,
		protocol VARCHAR(30) NOT NULL,
		event_type VARCHAR(30) NOT NULL,
		is_simulator BOOLEAN NOT NULL DEFAULT false,
		latency_ms INTEGER NOT NULL DEFAULT 0,
		message TEXT,
		occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_connection_logs_machine ON connection_logs(machine_id, occurred_at DESC);
	`
	_, err := p.db.ExecContext(ctx, schema)
	return err
}

// InsertAlarm menyimpan alarm baru
func (p *PostgresStore) InsertAlarm(ctx context.Context, al *models.AlarmEvent) (int64, error) {
	query := `
		INSERT INTO alarm_events (machine_id, machine_name, timestamp, code, message, severity, type, axis)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	var id int64
	err := p.db.QueryRowContext(ctx, query,
		al.MachineID, al.MachineName, al.Timestamp,
		al.Code, al.Message, al.Severity, al.Type, al.Axis,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("insert alarm gagal: %w", err)
	}

	logger.Warn("Alarm disimpan",
		zap.String("machine", al.MachineID),
		zap.String("severity", al.Severity),
		zap.String("message", al.Message),
	)
	return id, nil
}

// ResolveAlarm menandai alarm sebagai resolved
func (p *PostgresStore) ResolveAlarm(ctx context.Context, alarmID int64) error {
	_, err := p.db.ExecContext(ctx,
		`UPDATE alarm_events SET resolved_at = NOW() WHERE id = $1`,
		alarmID,
	)
	return err
}

// ListActiveAlarms mengambil semua alarm yang belum resolved
func (p *PostgresStore) ListActiveAlarms(ctx context.Context) ([]*models.AlarmEvent, error) {
	rows, err := p.db.QueryContext(ctx, `
		SELECT id, machine_id, machine_name, timestamp, code, message, severity, type, COALESCE(axis,'')
		FROM alarm_events
		WHERE resolved_at IS NULL
		ORDER BY timestamp DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alarms []*models.AlarmEvent
	for rows.Next() {
		al := &models.AlarmEvent{}
		err := rows.Scan(
			&al.ID, &al.MachineID, &al.MachineName, &al.Timestamp,
			&al.Code, &al.Message, &al.Severity, &al.Type, &al.Axis,
		)
		if err != nil {
			continue
		}
		alarms = append(alarms, al)
	}
	return alarms, rows.Err()
}

// ListAlarmHistory mengambil riwayat alarm dengan filter
func (p *PostgresStore) ListAlarmHistory(ctx context.Context, machineID string, limit int) ([]*models.AlarmEvent, error) {
	query := `
		SELECT id, machine_id, machine_name, timestamp, resolved_at, code, message, severity, type, COALESCE(axis,'')
		FROM alarm_events
		WHERE ($1 = '' OR machine_id = $1)
		ORDER BY timestamp DESC
		LIMIT $2
	`
	rows, err := p.db.QueryContext(ctx, query, machineID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alarms []*models.AlarmEvent
	for rows.Next() {
		al := &models.AlarmEvent{}
		err := rows.Scan(
			&al.ID, &al.MachineID, &al.MachineName, &al.Timestamp, &al.ResolvedAt,
			&al.Code, &al.Message, &al.Severity, &al.Type, &al.Axis,
		)
		if err != nil {
			continue
		}
		alarms = append(alarms, al)
	}
	return alarms, rows.Err()
}

// InsertOEE menyimpan hasil kalkulasi OEE
func (p *PostgresStore) InsertOEE(ctx context.Context, oee *models.OEEMetrics) error {
	_, err := p.db.ExecContext(ctx, `
		INSERT INTO oee_history
			(machine_id, machine_name, period, calculated_at,
			 availability, performance, quality, oee,
			 planned_time, operating_time, cutting_time, alarm_count)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
	`,
		oee.MachineID, oee.MachineName, oee.Period, oee.CalculatedAt,
		oee.Availability, oee.Performance, oee.Quality, oee.OEE,
		oee.PlannedTime, oee.OperatingTime, oee.CuttingTime, oee.AlarmCount,
	)
	return err
}

func (p *PostgresStore) InsertProductionLog(ctx context.Context, log *models.ProductionLog) (int64, error) {
	query := `
		INSERT INTO production_logs
			(machine_id, machine_name, work_order, part_number, shift, operator_id, qty_ok, qty_ng,
			 cycle_time_actual, operating_time_min, downtime_min, downtime_category,
			 oee, availability, performance, quality, timestamp)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
		RETURNING id
	`
	var id int64
	err := p.db.QueryRowContext(ctx, query,
		log.MachineID, log.MachineName, log.WorkOrder, log.PartNumber, log.Shift, log.OperatorID,
		log.QtyOK, log.QtyNG, log.CycleTimeActual, log.OperatingTimeMin, log.DowntimeMin,
		log.DowntimeCategory, log.OEE, log.Availability, log.Performance, log.Quality, log.Timestamp,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("insert production log gagal: %w", err)
	}
	return id, nil
}

func (p *PostgresStore) InsertDowntimeLog(ctx context.Context, log *models.DowntimeLog) (int64, error) {
	query := `
		INSERT INTO downtime_logs (machine_id, category, reason, started_at, resolved_at, action_taken)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id
	`
	var id int64
	err := p.db.QueryRowContext(ctx, query,
		log.MachineID, log.Category, log.Reason, log.StartedAt, log.ResolvedAt, log.ActionTaken,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("insert downtime log gagal: %w", err)
	}
	return id, nil
}

func (p *PostgresStore) GetProductionSummary(ctx context.Context, machineID string, day time.Time, shift int) (map[string]interface{}, error) {
	query := `
		SELECT
			COALESCE(SUM(qty_ok), 0),
			COALESCE(SUM(qty_ng), 0),
			COALESCE(AVG(cycle_time_actual), 0),
			COALESCE(SUM(operating_time_min), 0),
			COALESCE(SUM(downtime_min), 0),
			COALESCE(AVG(oee), 0)
		FROM production_logs
		WHERE ($1 = '' OR machine_id = $1)
		  AND DATE(timestamp AT TIME ZONE 'Asia/Jakarta') = $2
		  AND ($3 = 0 OR shift = $3)
	`
	var qtyOK, qtyNG int
	var cycleAvg, operating, downtime, oee float64
	if err := p.db.QueryRowContext(ctx, query, machineID, day.Format("2006-01-02"), shift).
		Scan(&qtyOK, &qtyNG, &cycleAvg, &operating, &downtime, &oee); err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"machine_id":         machineID,
		"date":               day.Format("2006-01-02"),
		"shift":              shift,
		"qty_ok":             qtyOK,
		"qty_ng":             qtyNG,
		"avg_cycle_time":     cycleAvg,
		"operating_time_min": operating,
		"downtime_min":       downtime,
		"avg_oee":            oee,
	}, nil
}

func (p *PostgresStore) EnqueueSync(ctx context.Context, eventType, endpoint, machineID string, payload []byte) error {
	_, err := p.db.ExecContext(ctx, `
		INSERT INTO mango_sync_queue (event_type, endpoint, machine_id, payload)
		VALUES ($1, $2, $3, $4::jsonb)
	`, eventType, endpoint, machineID, string(payload))
	if err != nil {
		return fmt.Errorf("enqueue sync gagal: %w", err)
	}
	return nil
}

func (p *PostgresStore) ListPendingSync(ctx context.Context, limit int) ([]*models.SyncQueueItem, error) {
	rows, err := p.db.QueryContext(ctx, `
		SELECT id, event_type, endpoint, COALESCE(machine_id, ''), payload::text, status, attempts,
		       COALESCE(last_error, ''), available_at, last_attempt_at, sent_at, created_at
		FROM mango_sync_queue
		WHERE status IN ('pending', 'failed') AND available_at <= NOW()
		ORDER BY created_at ASC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*models.SyncQueueItem, 0)
	for rows.Next() {
		item := &models.SyncQueueItem{}
		var payload string
		if err := rows.Scan(
			&item.ID, &item.EventType, &item.Endpoint, &item.MachineID, &payload, &item.Status,
			&item.Attempts, &item.LastError, &item.AvailableAt, &item.LastAttemptAt, &item.SentAt, &item.CreatedAt,
		); err != nil {
			return nil, err
		}
		item.Payload = []byte(payload)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *PostgresStore) MarkSyncDelivered(ctx context.Context, id int64) error {
	_, err := p.db.ExecContext(ctx, `
		UPDATE mango_sync_queue
		SET status = 'sent', sent_at = NOW(), last_attempt_at = NOW(), last_error = NULL
		WHERE id = $1
	`, id)
	return err
}

func (p *PostgresStore) MarkSyncFailed(ctx context.Context, id int64, lastError string, delay time.Duration) error {
	_, err := p.db.ExecContext(ctx, `
		UPDATE mango_sync_queue
		SET status = 'failed',
		    attempts = attempts + 1,
		    last_attempt_at = NOW(),
		    last_error = $2,
		    available_at = NOW() + ($3 * INTERVAL '1 second')
		WHERE id = $1
	`, id, lastError, int(delay.Seconds()))
	return err
}

func (p *PostgresStore) CountPendingSync(ctx context.Context) (int, error) {
	var count int
	err := p.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM mango_sync_queue WHERE status IN ('pending', 'failed')
	`).Scan(&count)
	return count, err
}

// CountAlarmsSince menghitung jumlah alarm sejak waktu tertentu
func (p *PostgresStore) CountAlarmsSince(ctx context.Context, machineID string, since time.Time) (int, error) {
	var count int
	err := p.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM alarm_events WHERE machine_id = $1 AND timestamp >= $2`,
		machineID, since,
	).Scan(&count)
	return count, err
}

// Close menutup koneksi database
func (p *PostgresStore) Close() error {
	return p.db.Close()
}

// ─── Operators & check-in (shop floor) ───────────────────────────────────────

func (p *PostgresStore) UpsertOperator(ctx context.Context, op *models.Operator) error {
	_, err := p.db.ExecContext(ctx, `
		INSERT INTO operators (id, name, department, default_shift)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			department = EXCLUDED.department,
			default_shift = EXCLUDED.default_shift
	`, op.ID, op.Name, op.Department, op.DefaultShift)
	return err
}

func (p *PostgresStore) ListOperators(ctx context.Context) ([]models.Operator, error) {
	rows, err := p.db.QueryContext(ctx, `
		SELECT id, name, COALESCE(department,''), COALESCE(default_shift, 0), created_at
		FROM operators ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Operator
	for rows.Next() {
		var o models.Operator
		if err := rows.Scan(&o.ID, &o.Name, &o.Department, &o.DefaultShift, &o.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

func (p *PostgresStore) InsertOperatorCheckin(ctx context.Context, c *models.OperatorCheckin) (int64, error) {
	var id int64
	err := p.db.QueryRowContext(ctx, `
		INSERT INTO operator_checkins (machine_id, operator_id, shift, work_order, part_number, target_qty)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, c.MachineID, nullStr(c.OperatorID), c.Shift, nullStr(c.WorkOrder), nullStr(c.PartNumber), c.TargetQty).
		Scan(&id)
	return id, err
}

func (p *PostgresStore) GetCurrentCheckin(ctx context.Context, machineID string) (*models.OperatorCheckin, error) {
	row := p.db.QueryRowContext(ctx, `
		SELECT id, machine_id, COALESCE(operator_id,''), shift,
		       COALESCE(work_order,''), COALESCE(part_number,''), COALESCE(target_qty, 0),
		       checked_in_at, checked_out_at
		FROM operator_checkins
		WHERE machine_id = $1 AND checked_out_at IS NULL
		ORDER BY checked_in_at DESC LIMIT 1
	`, machineID)

	var c models.OperatorCheckin
	var outAt sql.NullTime
	if err := row.Scan(&c.ID, &c.MachineID, &c.OperatorID, &c.Shift, &c.WorkOrder, &c.PartNumber, &c.TargetQty, &c.CheckedInAt, &outAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	if outAt.Valid {
		c.CheckedOutAt = &outAt.Time
	}
	return &c, nil
}

func (p *PostgresStore) CheckoutOperator(ctx context.Context, checkinID int64) error {
	_, err := p.db.ExecContext(ctx, `
		UPDATE operator_checkins SET checked_out_at = NOW() WHERE id = $1 AND checked_out_at IS NULL
	`, checkinID)
	return err
}

func (p *PostgresStore) ResolveDowntimeLog(ctx context.Context, id int64, actionTaken string) error {
	_, err := p.db.ExecContext(ctx, `
		UPDATE downtime_logs SET resolved_at = NOW(), action_taken = COALESCE($2, action_taken) WHERE id = $1 AND resolved_at IS NULL
	`, id, actionTaken)
	return err
}

// ─── machine_configs CRUD ───────────────────────────────────────────────────

func (p *PostgresStore) ListMachineConfigs(ctx context.Context) ([]models.MachineConfigRow, error) {
	rows, err := p.db.QueryContext(ctx, `
		SELECT id, name, machine_type, protocol, COALESCE(location,''),
		       connection_config::text, production_config::text, mqtt_topics::text,
		       enabled, created_at, updated_at
		FROM machine_configs ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.MachineConfigRow
	for rows.Next() {
		var r models.MachineConfigRow
		if err := rows.Scan(
			&r.ID, &r.Name, &r.MachineType, &r.Protocol, &r.Location,
			&r.ConnectionConfigJSON, &r.ProductionConfigJSON, &r.MQTTTopicsJSON,
			&r.Enabled, &r.CreatedAt, &r.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

func (p *PostgresStore) GetMachineConfig(ctx context.Context, id string) (*models.MachineConfigRow, error) {
	row := p.db.QueryRowContext(ctx, `
		SELECT id, name, machine_type, protocol, COALESCE(location,''),
		       connection_config::text, production_config::text, mqtt_topics::text,
		       enabled, created_at, updated_at
		FROM machine_configs WHERE id = $1
	`, id)
	var r models.MachineConfigRow
	if err := row.Scan(
		&r.ID, &r.Name, &r.MachineType, &r.Protocol, &r.Location,
		&r.ConnectionConfigJSON, &r.ProductionConfigJSON, &r.MQTTTopicsJSON,
		&r.Enabled, &r.CreatedAt, &r.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &r, nil
}

func (p *PostgresStore) UpsertMachineConfig(ctx context.Context, r *models.MachineConfigRow) error {
	_, err := p.db.ExecContext(ctx, `
		INSERT INTO machine_configs (id, name, machine_type, protocol, location, connection_config, production_config, mqtt_topics, enabled, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			machine_type = EXCLUDED.machine_type,
			protocol = EXCLUDED.protocol,
			location = EXCLUDED.location,
			connection_config = EXCLUDED.connection_config,
			production_config = EXCLUDED.production_config,
			mqtt_topics = EXCLUDED.mqtt_topics,
			enabled = EXCLUDED.enabled,
			updated_at = NOW()
	`, r.ID, r.Name, r.MachineType, r.Protocol, r.Location,
		r.ConnectionConfigJSON, r.ProductionConfigJSON, r.MQTTTopicsJSON, r.Enabled)
	return err
}

func (p *PostgresStore) UpsertMachineMasterData(ctx context.Context, r *models.MachineConfigRow) error {
	existing, err := p.GetMachineConfig(ctx, r.ID)
	if err != nil {
		return err
	}

	protocol := "mqtt"
	connectionConfig := "{}"
	productionConfig := "{}"
	mqttTopics := "{}"
	enabled := true

	if existing != nil {
		if existing.Protocol != "" {
			protocol = existing.Protocol
		}
		if existing.ConnectionConfigJSON != "" {
			connectionConfig = existing.ConnectionConfigJSON
		}
		if existing.ProductionConfigJSON != "" {
			productionConfig = existing.ProductionConfigJSON
		}
		if existing.MQTTTopicsJSON != "" {
			mqttTopics = existing.MQTTTopicsJSON
		}
		enabled = existing.Enabled
	}

	_, err = p.db.ExecContext(ctx, `
		INSERT INTO machine_configs (id, name, machine_type, protocol, location, connection_config, production_config, mqtt_topics, enabled, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			machine_type = EXCLUDED.machine_type,
			location = EXCLUDED.location,
			protocol = machine_configs.protocol,
			connection_config = machine_configs.connection_config,
			production_config = machine_configs.production_config,
			mqtt_topics = machine_configs.mqtt_topics,
			enabled = machine_configs.enabled,
			updated_at = NOW()
	`, r.ID, r.Name, r.MachineType, protocol, r.Location,
		connectionConfig, productionConfig, mqttTopics, enabled)
	return err
}

func (p *PostgresStore) DeleteMachineConfig(ctx context.Context, id string) error {
	_, err := p.db.ExecContext(ctx, `DELETE FROM machine_configs WHERE id = $1`, id)
	return err
}

func (p *PostgresStore) SaveWorkOrderPullSnapshot(ctx context.Context, payloadJSON []byte) error {
	_, err := p.db.ExecContext(ctx, `
		INSERT INTO mango_work_order_cache (payload) VALUES ($1::jsonb)
	`, string(payloadJSON))
	return err
}

func (p *PostgresStore) GetLatestWorkOrderPullSnapshot(ctx context.Context) ([]byte, error) {
	var payload string
	err := p.db.QueryRowContext(ctx, `
		SELECT payload::text FROM mango_work_order_cache ORDER BY snapshot_at DESC LIMIT 1
	`).Scan(&payload)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return []byte(payload), nil
}

func nullStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

// ─── Connection Logs ────────────────────────────────────────────────────────

func (p *PostgresStore) InsertConnectionLog(ctx context.Context, log *models.ConnectionLog) error {
	_, err := p.db.ExecContext(ctx, `
		INSERT INTO connection_logs (machine_id, machine_name, protocol, event_type, is_simulator, latency_ms, message, occurred_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, log.MachineID, log.MachineName, log.Protocol, log.EventType, log.IsSimulator, log.LatencyMs, log.Message, log.OccurredAt)
	return err
}

func (p *PostgresStore) ListConnectionLogs(ctx context.Context, machineID, eventType string, limit, offset int) ([]*models.ConnectionLog, int, error) {
	// Query Count
	countQuery := `SELECT COUNT(*) FROM connection_logs WHERE ($1 = '' OR machine_id = $1) AND ($2 = '' OR event_type = $2)`
	var total int
	if err := p.db.QueryRowContext(ctx, countQuery, machineID, eventType).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Query Data
	query := `
		SELECT id, machine_id, machine_name, protocol, event_type, is_simulator, latency_ms, COALESCE(message,''), occurred_at
		FROM connection_logs
		WHERE ($1 = '' OR machine_id = $1) AND ($2 = '' OR event_type = $2)
		ORDER BY occurred_at DESC
		LIMIT $3 OFFSET $4
	`
	rows, err := p.db.QueryContext(ctx, query, machineID, eventType, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []*models.ConnectionLog
	for rows.Next() {
		l := &models.ConnectionLog{}
		if err := rows.Scan(
			&l.ID, &l.MachineID, &l.MachineName, &l.Protocol, &l.EventType,
			&l.IsSimulator, &l.LatencyMs, &l.Message, &l.OccurredAt,
		); err != nil {
			continue
		}
		logs = append(logs, l)
	}

	return logs, total, nil
}
