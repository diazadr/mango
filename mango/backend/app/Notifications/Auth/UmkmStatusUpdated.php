<?php

namespace App\Notifications\Auth;

use App\Models\Umkm\Umkm;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UmkmStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Umkm $umkm,
        public string $status
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = ($this->status === 'active')
            ? 'Selamat! Pendaftaran UMKM Anda telah disetujui.'
            : 'Mohon maaf, pendaftaran UMKM Anda belum dapat kami setujui saat ini.';

        return (new MailMessage)
            ->subject('Update Status Pendaftaran UMKM - MANGO')
            ->greeting('Halo, '.$notifiable->name)
            ->line($message)
            ->action('Lihat Dashboard', url('/dashboard'))
            ->line('Terima kasih telah menggunakan sistem MANGO!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'umkm_id' => $this->umkm->id,
            'umkm_name' => $this->umkm->name,
            'status' => $this->status,
            'message' => ($this->status === 'active')
                ? 'UMKM '.$this->umkm->name.' telah disetujui.'
                : 'Pendaftaran UMKM '.$this->umkm->name.' ditolak.',
            'type' => 'umkm_status',
        ];
    }
}
