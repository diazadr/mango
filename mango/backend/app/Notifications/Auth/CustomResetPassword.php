<?php

namespace App\Notifications\Auth;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends ResetPassword
{
    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $locale = app()->getLocale();
        $frontendUrl = config('app.frontend_url') ?: 'http://localhost:3000';
        $url = $frontendUrl . "/{$locale}/reset-password/{$this->token}?email=" . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Atur Ulang Kata Sandi - MANGO')
            ->view('emails.reset-password', [
                'url' => $url,
                'name' => $notifiable->name,
                'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]);
    }
}
