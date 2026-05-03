<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atur Ulang Kata Sandi - MANGO</title>
    <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding-bottom: 40px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            margin-top: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background-color: #0f172a;
            padding: 32px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .content {
            padding: 40px 32px;
            color: #334155;
        }
        .content h2 {
            color: #0f172a;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .content p {
            margin-bottom: 24px;
            font-size: 16px;
            line-height: 1.6;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background-color: #f97316;
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            padding: 24px 32px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            background-color: #f1f5f9;
        }
        .accent {
            color: #f97316;
        }
    </style>
    <!-- Gmail Action Schema -->
    <script type="application/ld+json">
    {
      "@@context": "http://schema.org",
      "@@type": "EmailMessage",
      "potentialAction": {
        "@@type": "ViewAction",
        "name": "Atur Ulang Kata Sandi",
        "target": "{{ $url }}"
      },
      "description": "Atur ulang kata sandi Anda untuk mengakses platform MANGO"
    }
    </script>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Platform <span class="accent">MANGO</span></h1>
            </div>
            <div class="content">
                <h2>Halo, {{ $name }}!</h2>
                <p>Anda menerima email ini karena kami menerima permintaan atur ulang kata sandi untuk akun Anda di platform MANGO.</p>
                
                <div class="button-container">
                    <a href="{{ $url }}" class="button">Atur Ulang Kata Sandi</a>
                </div>
                
                <p>Tautan atur ulang kata sandi ini akan kedaluwarsa dalam {{ $count }} menit.</p>
                <p>Jika Anda tidak merasa meminta atur ulang kata sandi, tidak ada tindakan lebih lanjut yang diperlukan.</p>
                
                <p>Salam hangat,<br><strong>Tim MANGO</strong></p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} Platform MANGO. Semua hak dilindungi.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                    Jika tombol tidak berfungsi, salin tautan berikut ke browser Anda:<br>
                    <a href="{{ $url }}" style="color: #2563eb; word-break: break-all;">{{ $url }}</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>