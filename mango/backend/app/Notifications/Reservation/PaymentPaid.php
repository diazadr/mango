<?php

namespace App\Notifications\Reservation;

use App\Models\Machine\MachineReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke pemohon (UMKM) saat pembayaran mereka berhasil dikonfirmasi.
 */
class PaymentPaid extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public MachineReservation $reservation
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $machine = $this->reservation->machine?->name ?? 'Mesin #' . $this->reservation->machine_id;
        $amount  = 'Rp ' . number_format($this->reservation->xendit_paid_amount ?? $this->reservation->quoted_price, 0, ',', '.');
        $method  = strtoupper($this->reservation->xendit_payment_method ?? $this->reservation->payment_method ?? '-');
        $start   = $this->reservation->start_time?->format('d M Y H:i');
        $end     = $this->reservation->end_time?->format('d M Y H:i');

        return (new MailMessage)
            ->subject('Pembayaran Berhasil — Reservasi Mesin Dikonfirmasi')
            ->greeting('Halo, ' . $notifiable->name)
            ->line("Pembayaran Anda untuk reservasi mesin **{$machine}** telah berhasil.")
            ->line("Jumlah Dibayar: **{$amount}** via **{$method}**")
            ->line("Waktu Penggunaan: **{$start}** s.d. **{$end}**")
            ->action('Lihat Detail Reservasi', url('/workspace/machines/reservations/' . $this->reservation->id))
            ->line('Terima kasih telah menggunakan layanan MANGO Platform.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'reservation_payment_paid',
            'reservation_id' => $this->reservation->id,
            'machine_name'   => $this->reservation->machine?->name ?? 'Mesin #' . $this->reservation->machine_id,
            'amount'         => $this->reservation->xendit_paid_amount ?? $this->reservation->quoted_price,
            'method'         => $this->reservation->xendit_payment_method ?? $this->reservation->payment_method,
            'message'        => 'Pembayaran reservasi mesin Anda telah berhasil dikonfirmasi.',
        ];
    }
}
