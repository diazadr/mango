package models

import "time"

// ─── Payload dari simulator Python (fanuc/cnc/data) ───────────────────────────

type SimulatorPayload struct {
	Leitwert      float64                       `json:"leitwert"`
	LaengeIst     int                           `json:"laenge_ist"`
	LaengeSoll    int                           `json:"laenge_soll"`
	LaengeProzent float64                       `json:"laenge_prozent"`
	Achsen        map[string]map[string]float64 `json:"achsen"`
	ProgrammO5555 string                        `json:"programm_O5555"`
}

// ─── Status mesin (cnc/{type}/{id}/status) ────────────────────────────────────

type MachineStatus struct {
	MachineID   string    `json:"machine_id"`
	MachineName string    `json:"machine_name"`
	Timestamp   time.Time `json:"timestamp"`

	// FOCAS statinfo
	RunStatus int `json:"run_status"` // 0:STOP 1:HOLD 2:START 3:MSTR 4:RESTART
	AutoMode  int `json:"auto_mode"`  // 0:MDI 1:MEM 3:EDIT 4:HANDLE 5:JOG
	Emergency int `json:"emergency"`  // 0:normal 1:emergency
	Alarm     int `json:"alarm"`      // 0:no alarm 1:alarm
	Warning   int `json:"warning"`    // 0:no warning 1:warning
	Motion    int `json:"motion"`     // 0:stop 1:motion 2:dwell
	Edit      int `json:"edit"`       // 0:not editing 1:edit
	MSTB      int `json:"mstb"`       // 0:others 1:fin
	Battery   int `json:"battery"`    // 0:normal 1:low

	// Derived
	IsRunning   bool   `json:"is_running"`
	IsAlarm     bool   `json:"is_alarm"`
	IsEmergency bool   `json:"is_emergency"`
	ProgramName string `json:"program_name"`
}

// ─── Data sumbu (cnc/{type}/{id}/axis) ────────────────────────────────────────

type AxisData struct {
	MachineID string    `json:"machine_id"`
	Timestamp time.Time `json:"timestamp"`

	AbsX float64 `json:"abs_x"`
	AbsY float64 `json:"abs_y"`
	AbsZ float64 `json:"abs_z"`
	RelX float64 `json:"rel_x"`
	RelY float64 `json:"rel_y"`
	RelZ float64 `json:"rel_z"`

	Feedrate        float64 `json:"feedrate"`         // mm/min aktual
	FeedrateOverride int    `json:"feedrate_override"` // %
}

// ─── Data spindle (cnc/{type}/{id}/spindle) ───────────────────────────────────

type SpindleData struct {
	MachineID string    `json:"machine_id"`
	Timestamp time.Time `json:"timestamp"`

	SpeedActual   float64 `json:"speed_actual"`    // RPM
	SpeedCommand  float64 `json:"speed_command"`   // RPM
	LoadPercent   float64 `json:"load_percent"`    // %
	Override      int     `json:"override"`         // %
}

// ─── Data timer (cnc/{type}/{id}/timer) ───────────────────────────────────────

type TimerData struct {
	MachineID string    `json:"machine_id"`
	Timestamp time.Time `json:"timestamp"`

	// Float64 agar menerima nilai desimal dari simulator (misal: 0.33 menit)
	OperatingTimeMin  float64 `json:"operating_time_min"`
	OperatingTimeMsec float64 `json:"operating_time_msec"`
	CuttingTimeMin    float64 `json:"cutting_time_min"`
	CuttingTimeMsec   float64 `json:"cutting_time_msec"`
	CycleTimeMin      float64 `json:"cycle_time_min"`
	CycleTimeMsec     float64 `json:"cycle_time_msec"`
}

// ─── Data tool (cnc/{type}/{id}/tool) ─────────────────────────────────────────

type ToolData struct {
	MachineID string    `json:"machine_id"`
	Timestamp time.Time `json:"timestamp"`

	ToolActual      int     `json:"tool_actual"`
	ToolNext        int     `json:"tool_next"`
	ToolAfterNext   int     `json:"tool_afternext"`
	LengthOffset    float64 `json:"length_offset"`
	RadiusOffset    float64 `json:"radius_offset"`
	LengthWear      float64 `json:"length_wear"`
	RadiusWear      float64 `json:"radius_wear"`
}

// ─── Alarm (cnc/{type}/{id}/alarm) ────────────────────────────────────────────

type AlarmEvent struct {
	ID          int64     `json:"id"`
	MachineID   string    `json:"machine_id"`
	MachineName string    `json:"machine_name"`
	Timestamp   time.Time `json:"timestamp"`
	ResolvedAt  *time.Time `json:"resolved_at,omitempty"`

	Code     int    `json:"code"`
	Message  string `json:"message"`
	Severity string `json:"severity"` // "info", "warning", "critical", "emergency"
	Type     string `json:"type"`     // "servo", "overheat", "parameter", "io", "system"
	Axis     string `json:"axis,omitempty"`
}

func (a *AlarmEvent) IsResolved() bool {
	return a.ResolvedAt != nil
}

// ─── OEE (Overall Equipment Effectiveness) ────────────────────────────────────

type OEEMetrics struct {
	MachineID   string    `json:"machine_id"`
	MachineName string    `json:"machine_name"`
	Period      string    `json:"period"` // "shift", "day", "week"
	CalculatedAt time.Time `json:"calculated_at"`

	// Tiga komponen OEE
	Availability float64 `json:"availability"` // %
	Performance  float64 `json:"performance"`  // %
	Quality      float64 `json:"quality"`      // % (default 100 jika tidak ada scrap data)
	OEE          float64 `json:"oee"`          // %

	// Raw values
	PlannedTime     float64 `json:"planned_time_min"`
	OperatingTime   float64 `json:"operating_time_min"`
	CuttingTime     float64 `json:"cutting_time_min"`
	AlarmCount      int     `json:"alarm_count"`
}

// ─── Realtime state (disimpan di Redis) ───────────────────────────────────────

type MachineState struct {
	MachineID   string         `json:"machine_id"`
	MachineName string         `json:"machine_name"`
	LastSeen    time.Time      `json:"last_seen"`
	Online      bool           `json:"online"`
	Status      *MachineStatus `json:"status,omitempty"`
	Axis        *AxisData      `json:"axis,omitempty"`
	Spindle     *SpindleData   `json:"spindle,omitempty"`
	Tool        *ToolData      `json:"tool,omitempty"`
	Timer       *TimerData     `json:"timer,omitempty"`
	ActiveAlarm *AlarmEvent    `json:"active_alarm,omitempty"`
}

type ProductionLog struct {
	ID                int64     `json:"id"`
	MachineID         string    `json:"machine_id"`
	MachineName       string    `json:"machine_name"`
	WorkOrder         string    `json:"work_order"`
	PartNumber        string    `json:"part_number"`
	Shift             int       `json:"shift"`
	OperatorID        string    `json:"operator_id"`
	QtyOK             int       `json:"qty_ok"`
	QtyNG             int       `json:"qty_ng"`
	CycleTimeActual   float64   `json:"cycle_time_actual"`
	IdealCycleTimeSec float64   `json:"ideal_cycle_time_sec"`
	OperatingTimeMin  float64   `json:"operating_time_min"`
	DowntimeMin       float64   `json:"downtime_min"`
	DowntimeCategory  string    `json:"downtime_category"`
	OEE               float64   `json:"oee"`
	Availability      float64   `json:"availability"`
	Performance       float64   `json:"performance"`
	Quality           float64   `json:"quality"`
	Timestamp         time.Time `json:"timestamp"`
}

type DowntimeLog struct {
	ID          int64      `json:"id"`
	MachineID   string     `json:"machine_id"`
	WorkOrder   string     `json:"work_order,omitempty"`
	OperatorID  string     `json:"operator_id,omitempty"`
	Category    string     `json:"category"`
	Reason      string     `json:"reason"`
	StartedAt   time.Time  `json:"started_at"`
	ResolvedAt  *time.Time `json:"resolved_at,omitempty"`
	ActionTaken string     `json:"action_taken"`
	DurationMin float64    `json:"duration_min"`
}

type ScrapLog struct {
	ID         int64     `json:"id"`
	MachineID  string    `json:"machine_id"`
	WorkOrder  string    `json:"work_order"`
	Reason     string    `json:"reason"`
	Qty        int       `json:"qty"`
	Timestamp  time.Time `json:"timestamp"`
}

type SyncQueueItem struct {
	ID            int64      `json:"id"`
	EventType     string     `json:"event_type"`
	Endpoint      string     `json:"endpoint"`
	MachineID     string     `json:"machine_id"`
	Payload       []byte     `json:"payload"`
	Status        string     `json:"status"`
	Attempts      int        `json:"attempts"`
	LastError     string     `json:"last_error"`
	AvailableAt   time.Time  `json:"available_at"`
	LastAttemptAt *time.Time `json:"last_attempt_at,omitempty"`
	SentAt        *time.Time `json:"sent_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

// ─── Shop floor operators (PostgreSQL) ─────────────────────────────────────────

type Operator struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Department   string    `json:"department,omitempty"`
	DefaultShift int       `json:"default_shift,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type OperatorCheckin struct {
	ID                 int64      `json:"id"`
	MachineID          string     `json:"machine_id"`
	OperatorID         string     `json:"operator_id,omitempty"`
	Shift              int        `json:"shift"`
	WorkOrder          string     `json:"work_order,omitempty"`
	PartNumber         string     `json:"part_number,omitempty"`
	TargetQty          int        `json:"target_qty,omitempty"`
	IdealCycleTimeSec  float64    `json:"ideal_cycle_time_sec,omitempty"`
	ActualQtyOK        int        `json:"actual_qty_ok"`
	ActualQtyNG        int        `json:"actual_qty_ng"`
	CheckedInAt        time.Time  `json:"checked_in_at"`
	CheckedOutAt       *time.Time `json:"checked_out_at,omitempty"`
}

type MasterReason struct {
	ID          int64  `json:"id"`
	Type        string `json:"type"`     // 'downtime' or 'scrap'
	Category    string `json:"category"` // e.g. 'Setup', 'Breakdown', 'Material'
	Code        string `json:"code"`     // e.g. 'D01', 'S01'
	Description string `json:"description"`
	IsActive    bool   `json:"is_active"`
}

// MachineConfigRow mirrors machine_configs table (JSON as raw strings for forms/API)
type MachineConfigRow struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	MachineType          string    `json:"machine_type"`
	Protocol             string    `json:"protocol"`
	Location             string    `json:"location,omitempty"`
	ConnectionConfigJSON string    `json:"connection_config"`
	ProductionConfigJSON string    `json:"production_config"`
	MQTTTopicsJSON       string    `json:"mqtt_topics"`
	Enabled              bool      `json:"enabled"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type MangoSyncStatus struct {
	Enabled            bool      `json:"enabled"`
	SiteID             string    `json:"site_id"`
	BaseURL            string    `json:"base_url"`
	LastProductionPush time.Time `json:"last_production_push,omitempty"`
	LastAlarmPush      time.Time `json:"last_alarm_push,omitempty"`
	LastWorkOrderPull  time.Time `json:"last_work_order_pull,omitempty"`
	LastMasterDataPull time.Time `json:"last_master_data_pull,omitempty"`
	LastError          string    `json:"last_error,omitempty"`
	PendingQueue       int       `json:"pending_queue"`
	LastPulledOrders   int       `json:"last_pulled_orders"`
	LastPulledMachines int       `json:"last_pulled_machines"`
}

type ConnectionLog struct {
	ID          int64     `json:"id"`
	MachineID   string    `json:"machine_id"`
	MachineName string    `json:"machine_name"`
	Protocol    string    `json:"protocol"`
	EventType   string    `json:"event_type"` // connected, disconnected, error, timeout, reconnecting
	IsSimulator bool      `json:"is_simulator"`
	LatencyMs   int       `json:"latency_ms"`
	Message     string    `json:"message"`
	OccurredAt  time.Time `json:"occurred_at"`
}
