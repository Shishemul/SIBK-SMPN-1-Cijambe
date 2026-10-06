import React, { useState } from 'react';
import {
  Rocket,
  Globe,
  Server,
  Cloud,
  Terminal,
  FileCode,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FolderArchive,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DeployTutorialView: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'vercel' | 'cpanel' | 'netlify' | 'vps'>('vercel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const htaccessContent = `# ====================================================================
# Konfigurasi Apache .htaccess untuk SI-BK SMP Negeri 1 Cijambe (SPA)
# Letakkan file ini langsung di dalam folder public_html atau root subdomain
# ====================================================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Jika file atau folder fisik ada, layani secara langsung
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Jika file tidak ditemukan, arahkan ke index.html (React Router SPA)
  RewriteRule ^ index.html [L]
</IfModule>

# Keamanan & Optimasi Header
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Kompresi Gzip untuk mempercepat muat halaman
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>`;

  const vercelJsonContent = `{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const netlifyTomlContent = `[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  command = "npm run build"
  publish = "dist"`;

  const nginxConfContent = `server {
    listen 80;
    listen [::]:80;
    server_name bk.smpn1cijambe.sch.id; # Ganti dengan domain Anda

    root /var/www/si-bk-smpn1cijambe/dist;
    index index.html;

    # Penanganan SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache untuk aset statis agar loading cepat
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}`;

  const downloadConfigFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-blue-400/30">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
            Panduan Resmi Deployment Produksi
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tutorial Deploy SI-BK SMP Negeri 1 Cijambe
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Panduan langkah demi langkah mempublikasikan sistem informasi konseling dan kedisiplinan sekolah ke server online (Vercel, cPanel Web Hosting Sekolah, Netlify, atau VPS) agar dapat diakses oleh guru, siswa, dan orang tua 24 jam.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Framework: <strong>React 19 + Vite</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Output Build: <strong>Folder `dist/`</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Database: <strong>Supabase PostgreSQL</strong></span>
          </div>
        </div>
      </div>

      {/* Hosting Platform Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActivePlatform('vercel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activePlatform === 'vercel'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Rocket className="w-4 h-4 text-blue-600" />
          Vercel (Paling Mudah & Gratis)
        </button>
        <button
          onClick={() => setActivePlatform('cpanel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activePlatform === 'cpanel'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-600" />
          cPanel / Hosting Sekolah (.sch.id)
        </button>
        <button
          onClick={() => setActivePlatform('netlify')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activePlatform === 'netlify'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cloud className="w-4 h-4 text-teal-600" />
          Netlify (Drag & Drop)
        </button>
        <button
          onClick={() => setActivePlatform('vps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activePlatform === 'vps'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4 text-slate-800" />
          VPS Ubuntu / Nginx
        </button>
      </div>

      {/* Guide Content: Vercel */}
      {activePlatform === 'vercel' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-600" />
                Cara Deploy ke Vercel (Gratis & Otomatis SSL HTTPS)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekomendasi terbaik untuk SMP Negeri 1 Cijambe dengan kecepatan akses server CDN global tercepat.
              </p>
            </div>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Buka Vercel <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Upload / Push Source Code ke GitHub</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unggah source code aplikasi ini ke akun GitHub sekolah atau guru BK (repository bisa dibuat Private atau Public).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Import Repository di Vercel</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka <strong>vercel.com</strong>, login dengan akun GitHub, klik tombol <strong>"Add New" &gt; "Project"</strong>, lalu pilih repository SI-BK yang sudah diupload.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Konfigurasi Pengaturan Build</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vercel akan otomatis mendeteksi project Vite. Pastikan pengaturannya seperti berikut:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-700">
                  <div>Framework Preset: <strong>Vite</strong></div>
                  <div>Build Command: <strong>npm run build</strong></div>
                  <div>Output Directory: <strong>dist</strong></div>
                  <div>Install Command: <strong>npm install</strong></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-2 w-full">
                <h4 className="text-xs font-bold text-slate-900">Tambahkan File vercel.json (Mencegah 404 Refresh)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  File ini memastikan ketika pengguna me-refresh halaman seperti <code>/violations</code> atau <code>/achievements</code>, halaman tetap terbuka normal.
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                    {vercelJsonContent}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(vercelJsonContent, 'vercel')}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'vercel' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin vercel.json
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => downloadConfigFile(vercelJsonContent, 'vercel.json')}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh file vercel.json
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                5
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Klik "Deploy"</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dalam waktu sekitar 30 detik, aplikasi Anda sudah live dengan domain gratis seperti <code>sibk-smpn1cijambe.vercel.app</code> dan sertifikat SSL aktif otomatis!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Content: cPanel / Web Hosting Sekolah */}
      {activePlatform === 'cpanel' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Cara Deploy ke cPanel Hosting Sekolah (Domain .sch.id)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan panduan ini jika SMP Negeri 1 Cijambe ingin memasang aplikasi pada subdomain sekolah (misal: <code>bk.smpn1cijambe.sch.id</code>).
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Jalankan Perintah Build di Komputer</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka terminal di folder project, lalu jalankan perintah berikut untuk mengompilasi aplikasi ke file statis produksi:
                </p>
                <div className="flex items-center justify-between bg-slate-900 text-slate-100 px-4 py-2.5 rounded-lg text-xs font-mono">
                  <span>npm run build</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'build_cmd')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'build_cmd' ? 'Tersalin' : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Setelah selesai, akan terbentuk sebuah folder baru bernama <strong>`dist/`</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Kompres Seluruh Isi Folder `dist/` ke ZIP</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka folder <code>dist/</code>, pilih seluruh isinya (<code>index.html</code>, folder <code>assets/</code>, dsb.), lalu klik kanan &gt; <em>Compress to ZIP</em> (misal dinamakan <code>si-bk-dist.zip</code>).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Buka File Manager di cPanel</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Login ke cPanel web hosting SMP Negeri 1 Cijambe, pilih menu <strong>File Manager</strong>, kemudian masuk ke folder root target:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
                  <li>Domain utama: folder <code>public_html/</code></li>
                  <li>Subdomain BK: folder subdomain (misal: <code>public_html/bk/</code>)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Upload dan Ekstrak ZIP</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload file <code>si-bk-dist.zip</code> ke folder tersebut, lalu klik kanan &gt; <strong>Extract</strong>. Pastikan file <code>index.html</code> berada langsung di dalam folder root subdomain.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                5
              </div>
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">Buat File `.htaccess` (SANGAT PENTING!)</h4>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                    Wajib untuk cPanel
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika file ini tidak dibuat, server Apache akan menampilkan error 404 ketika pengguna me-refresh halaman atau berpindah menu tab secara langsung.
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
                    {htaccessContent}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(htaccessContent, 'htaccess')}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'htaccess' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin .htaccess
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadConfigFile(htaccessContent, '.htaccess')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Berkas .htaccess Siap Pakai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Content: Netlify */}
      {activePlatform === 'netlify' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-teal-600" />
              Cara Deploy ke Netlify (Metode Drag & Drop Tercepat)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Anda bahkan bisa men-deploy aplikasi tanpa Git sama sekali dengan metode drag-and-drop folder build.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <h4 className="font-bold text-teal-900 mb-1">Metode 1: Drop Folder `dist` Langsung</h4>
              <ol className="list-decimal list-inside space-y-1 text-teal-800">
                <li>Jalankan <code>npm run build</code> di terminal.</li>
                <li>Buka <strong>app.netlify.com/drop</strong> di browser.</li>
                <li>Seret (*drag and drop*) folder <code>dist/</code> ke halaman tersebut.</li>
                <li>Website langsung tayang dalam 10 detik!</li>
              </ol>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Konfigurasi netlify.toml (Redirects SPA)</h4>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                  {netlifyTomlContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(netlifyTomlContent, 'netlify')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'netlify' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin netlify.toml
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Content: VPS Nginx */}
      {activePlatform === 'vps' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-800" />
              Cara Deploy ke Server VPS Ubuntu dengan Nginx Web Server
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cocok untuk dedicated server internal dinas pendidikan atau server mandiri sekolah.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Konfigurasi Virtual Host Nginx</h4>
              <p className="text-xs text-slate-600">
                Simpan konfigurasi berikut di <code>/etc/nginx/sites-available/sibk-smpn1cijambe</code>:
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                  {nginxConfContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(nginxConfContent, 'nginx')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'nginx' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin nginx.conf
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <span className="font-bold text-slate-800">Perintah Aktifkan & Dapatkan SSL Gratis:</span>
              <pre className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px]">
sudo ln -s /etc/nginx/sites-available/sibk-smpn1cijambe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d bk.smpn1cijambe.sch.id
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Deployment Checklist Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Checklist Pra-Publikasi (Sebelum Live)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
            <div>
              <span className="font-semibold text-slate-800">1. Jalankan Uji Build Lokal</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Pastikan perintah <code>npm run build</code> berjalan sukses tanpa error.</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
            <div>
              <span className="font-semibold text-slate-800">2. Hubungkan Supabase Database</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Konfigurasikan Project URL dan Anon Key Supabase di tab Cadangan & Database.</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
            <div>
              <span className="font-semibold text-slate-800">3. Siapkan File SPA Rewrites</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Gunakan <code>.htaccess</code> (cPanel) atau <code>vercel.json</code> (Vercel) agar reload aman.</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
            <div>
              <span className="font-semibold text-slate-800">4. Periksa Akun Admin Utama</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Pastikan username dan password Kepala Sekolah / Admin BK sudah dicatat aman.</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
