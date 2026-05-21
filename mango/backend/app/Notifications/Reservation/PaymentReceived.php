<?php

namespace App\Notifications\Reservation;

use App\Models\Machine\MachineReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke pemilik mesin saat pembayaran diterima via Xendit (otomatis).
 */
class PaymentReceived extends Notification implements ShouldQueue
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
        $machine  = $this->reservation->machine?->name ?? 'Mesin #' . $this->reservation->machine_id;
        $umkm     = $this->reservation->requesterUmkm?->name ?? 'UMKM';
        $amount   = 'Rp ' . number_format($this->reservation->xendit_paid_amount ?? $this->reservation->quoted_price, 0, ',', '.');
        $method   = strtoupper($this->reservation->xendit_payment_method ?? $this->reservation->payment_method ?? '-');

        return (new MailMessage)
            ->subject('Pembayaran Diterima — Reservasi Mesin')
            ->greeting('Halo, ' . $notifiable->name)
            ->line("Pembayaran reservasi mesin **{$machine}** oleh **{$umkm}** telah diterima.")
            ->line("Jumlah: **{$amount}** via **{$method}**")
            ->action('Lihat Detail Reservasi', url('/workspace/machines/reservations/' . $this->reservation->id))
            ->line('Reservasi telah otomatis ditandai sebagai selesai.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'reservation_payment_received',
            'reservation_id' => $this->reservation->id,
            'machine_name'   => $this->reservation->machine?->name ?? 'Mesin #' . $this->reservation->machine_id,
            'umkm_name'      => $this->reservation->requesterUmkm?->name ?? 'UMKM',
            'amount'         => $this->reservation->xendit_paid_amount ?? $this->reservation->quoted_price,
            'method'         => $this->reservation->xendit_payment_method ?? $this->reservation->payment_method,
            'message'        => 'Pembayaran reservasi mesin telah diterima dan diverifikasi otomatis.',
        ];
    }
}
