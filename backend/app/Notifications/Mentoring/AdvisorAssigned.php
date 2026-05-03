<?php

namespace App\Notifications\Mentoring;

use App\Models\Mentoring\ConsultationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdvisorAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ConsultationRequest $request
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Penugasan Bimbingan Baru - MANGO')
            ->greeting('Halo, '.$notifiable->name)
            ->line('Anda telah ditugaskan untuk membimbing UMKM: '.$this->request->umkm->name)
            ->line('Topik Bimbingan: '.$this->request->topic)
            ->action('Lihat Detail Pengajuan', url('/workspace/advisor/mentoring/'.$this->request->id))
            ->line('Mohon segera tindak lanjuti untuk menjadwalkan sesi bimbingan.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->request->id,
            'umkm_name' => $this->request->umkm->name,
            'topic' => $this->request->topic,
            'message' => 'Anda ditugaskan membimbing UMKM '.$this->request->umkm->name,
            'type' => 'mentoring_assignment',
        ];
    }
}
