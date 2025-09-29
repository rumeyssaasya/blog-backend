# Blog ###
Node.js, Express ve MongoDB kullanılarak geliştirilmiş tam fonksiyonlu bir blog uygulamasıdır. Kullanıcılar hesap oluşturabilir, blog yazıları paylaşabilir, yorum yapabilir, yazıları beğenebilir ve arama/filtreleme özellikleriyle içeriklere erişebilirler.

***Özellikler
---

Kullanıcı Yönetimi:

Kayıt olma, giriş yapma, profil görüntüleme ve güncelleme.

JWT ile güvenli kimlik doğrulama.

Blog Yönetimi:

Blog yazısı oluşturma, güncelleme ve silme.

Yazılara resim yükleyebilme (form-data veya JSON).

Başlık, içerik ve etiketler ile blog içeriklerini yönetme.

Etkileşim:

Yazılara yorum ekleme ve yorumlara cevap verme.

Yazıları beğenme ve beğeniyi kaldırma.

Popülerlik ve tarih bazlı sıralama.

Arama ve Filtreleme:

Başlık ve içerik bazlı arama.

Yazar, etiket ve tarih aralığı ile filtreleme.

Sıralama seçenekleri: en yeni, en eski, en popüler, en az popüler.

Pagination (sayfalama) ile performans optimizasyonu.

Güvenlik ve Performans:

CORS ayarları.

Veritabanı indeksleme ve sorgu optimizasyonu.

Sadece gerekli alanların çekilmesi (select ve lean).

***Teknolojiler

Backend: Node.js, Express.js

Veritabanı: MongoDB, Mongoose

Dosya yükleme: Multer

Kimlik doğrulama: JWT

Test: Postman

API Endpoints
---
Kullanıcı (User) İşlemleri
-
POST	/api/users/register	Yeni kullanıcı kaydı
POST	/api/users/login	Kullanıcı girişi	
GET	/api/users/profile	Profil görüntüleme	
PUT	/api/users/profile	Profil güncelleme	
DELETE	/api/users/profile	Profil silme	
GET	/api/users	Tüm kullanıcıları listeleme	

Blog (Post) İşlemleri
-

POST	/api/posts	Blog yazısı oluşturma	
GET	/api/posts	Tüm blog yazılarını listeleme	
GET	/api/posts/:id	Tek bir blog yazısı	
PUT	/api/posts/:id	Blog yazısını güncelleme	
DELETE	/api/posts/:id	Blog yazısını silme	
PUT	/api/posts/:postId/like	Blog yazısını beğenme / beğeniyi kaldırma	
GET	/api/posts/:postId/likes	Blog yazısının beğenilerini listeleme	
GET	/api/posts/search	Blog yazısı arama ve filtreleme	

Yorum (Comment) İşlemleri
-
GET	/api/comments/:postId	Belirli bir postun tüm yorumlarını listeleme	
POST	/api/comments	Yorum ekleme	
POST	/api/comments/reply	Yorum cevabı ekleme	
