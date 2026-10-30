import { BusinessScenario } from '../types/lkm';

export const DEFAULT_SCENARIOS: BusinessScenario[] = [
  {
    id: 1,
    groupNumber: 1,
    businessName: 'Berkah Bakery Nusantara',
    category: 'Kuliner & Roti UMKM',
    ownerName: 'Ibu Ratna',
    story:
      'Ibu Ratna mengelola toko roti "Berkah Bakery Nusantara" yang memproduksi dua produk unggulan: Roti Cokelat Spesial dan Roti Keju Lumer. Setiap hari, Ibu Ratna ingin menentukan berapa banyak roti cokelat dan roti keju yang harus diproduksi agar keuntungan yang diperoleh maksimal. ' +
      'Untuk membuat 1 buah Roti Cokelat Spesial dibutuhkan 200 gram tepung terigu dan 100 gram mentega. Sedangkan untuk membuat 1 buah Roti Keju Lumer dibutuhkan 300 gram tepung terigu dan 100 gram mentega. ' +
      'Persediaan bahan baku di dapur toko setiap harinya dibatasi maksimal 18.000 gram (18 kg) tepung terigu dan 8.000 gram (8 kg) mentega. ' +
      'Keuntungan bersih dari penjualan 1 buah Roti Cokelat Spesial adalah Rp 4.000 dan 1 buah Roti Keju Lumer adalah Rp 5.000. ' +
      'Bantulah Ibu Ratna merancang perencanaan produksi optimal dengan model Program Linear!',
    productX: {
      name: 'Roti Cokelat Spesial',
      unit: 'buah',
      profitOrCost: 4000,
    },
    productY: {
      name: 'Roti Keju Lumer',
      unit: 'buah',
      profitOrCost: 5000,
    },
    objectiveType: 'maximize',
    objectiveLabel: 'Memaksimalkan Keuntungan Bersih Harian',
    constraints: [
      {
        id: 'c1',
        name: 'Bahan Baku Tepung Terigu (disederhanakan dalam ratusan gram)',
        coeffX: 2,
        coeffY: 3,
        operator: '<=',
        capacity: 180,
        unit: 'ratus gram',
      },
      {
        id: 'c2',
        name: 'Bahan Baku Mentega (disederhanakan dalam ratusan gram)',
        coeffX: 1,
        coeffY: 1,
        operator: '<=',
        capacity: 80,
        unit: 'ratus gram',
      },
    ],
    tips: 'Bagi kedua sisi kendala tepung dengan 100 gram untuk menyederhanakan koefisien: 200x + 300y <= 18000 menjadi 2x + 3y <= 180.',
  },
  {
    id: 2,
    groupNumber: 2,
    businessName: 'Kreatif Apparel & Sablon',
    category: 'Konveksi & Pakaian Kreatif',
    ownerName: 'Mas Danang',
    story:
      'Mas Danang mendirikan konveksi muda "Kreatif Apparel & Sablon". Menjelang tahun ajaran baru, konveksi ini menerima pesanan dua produk: Kaos Polos Sablon dan Kemeja Kancing Bordir. ' +
      'Untuk memproduksi 1 potong Kaos Polos Sablon diperlukan 1 meter kain katun combed dan 2 jam waktu pengerjaan jahit/sablon. ' +
      'Sedangkan untuk 1 potong Kemeja Kancing Bordir diperlukan 2 meter kain katun combed dan 2 jam waktu pengerjaan. ' +
      'Dalam satu periode produksi, stok kain katun yang tersedia maksimal 100 meter, dan total waktu pengerjaan tenaga jahit yang tersedia maksimal 120 jam. ' +
      'Keuntungan yang diperoleh adalah Rp 25.000 untuk setiap kaos dan Rp 40.000 untuk setiap kemeja. ' +
      'Berapa potong kaos dan kemeja yang harus diproduksi agar keuntungan Mas Danang mencapai nilai maksimum?',
    productX: {
      name: 'Kaos Polos Sablon',
      unit: 'potong',
      profitOrCost: 25000,
    },
    productY: {
      name: 'Kemeja Kancing Bordir',
      unit: 'potong',
      profitOrCost: 4000,
    },
    objectiveType: 'maximize',
    objectiveLabel: 'Memaksimalkan Keuntungan Produksi',
    constraints: [
      {
        id: 'c1',
        name: 'Persediaan Kain Katun Combed',
        coeffX: 1,
        coeffY: 2,
        operator: '<=',
        capacity: 100,
        unit: 'meter',
      },
      {
        id: 'c2',
        name: 'Kapasitas Waktu Tenaga Kerja',
        coeffX: 2,
        coeffY: 2,
        operator: '<=',
        capacity: 120,
        unit: 'jam',
      },
    ],
    tips: 'Pertidaksamaan kedua 2x + 2y <= 120 dapat disederhanakan menjadi x + y <= 60.',
  },
  {
    id: 3,
    groupNumber: 3,
    businessName: 'Koma Boba & Matcha Bar',
    category: 'Kedai Minuman Kekinian',
    ownerName: 'Kak Nisa',
    story:
      'Kak Nisa adalah wirausahawan muda pengelola gerai minuman "Koma Boba & Matcha Bar". Menu terlarisnya adalah Brown Sugar Boba Fresh Milk dan Matcha Latte Ice. ' +
      'Untuk meracik 1 cup Brown Sugar Boba dibutuhkan 200 ml susu segar dan 1 menit waktu penyajian barista. ' +
      'Untuk meracik 1 cup Matcha Latte dibutuhkan 100 ml susu segar dan 2 menit waktu penyajian barista. ' +
      'Persediaan susu segar hari ini dibatasi 16.000 ml (16 liter) dan total jam kerja shift barista yang tersedia untuk kedua menu tersebut adalah 200 menit. ' +
      'Keuntungan per cup Brown Sugar Boba adalah Rp 6.000 dan keuntungan per cup Matcha Latte adalah Rp 8.000. ' +
      'Rancanglah model linear programming untuk menemukan kombinasi penjualan terbaik!',
    productX: {
      name: 'Brown Sugar Boba',
      unit: 'cup',
      profitOrCost: 6000,
    },
    productY: {
      name: 'Matcha Latte Ice',
      unit: 'cup',
      profitOrCost: 8000,
    },
    objectiveType: 'maximize',
    objectiveLabel: 'Memaksimalkan Keuntungan Penjualan Minuman',
    constraints: [
      {
        id: 'c1',
        name: 'Persediaan Susu Segar (disederhanakan /100 ml)',
        coeffX: 2,
        coeffY: 1,
        operator: '<=',
        capacity: 160,
        unit: 'ratus ml',
      },
      {
        id: 'c2',
        name: 'Waktu Peracikan Barista',
        coeffX: 1,
        coeffY: 2,
        operator: '<=',
        capacity: 200,
        unit: 'menit',
      },
    ],
    tips: 'Susu segar 200x + 100y <= 16000 disederhanakan dengan dibagi 100 menjadi 2x + y <= 160.',
  },
  {
    id: 4,
    groupNumber: 4,
    businessName: 'Lestari Woodcraft & Furniture',
    category: 'Mebel & Pengrajin Kayu',
    ownerName: 'Pak Hadi',
    story:
      'Pak Hadi menjalankan usaha kerajinan mebel ramah lingkungan "Lestari Woodcraft". Menjelang pameran UMKM, bengkel mebel memproduksi dua barang favorit: Meja Belajar Minimalis dan Rak Buku 4 Tingkat. ' +
      'Setiap unit Meja Belajar memerlukan 3 lembar papan kayu jati belanda dan 1 hari kerja tim perakitan/finishing. ' +
      'Setiap unit Rak Buku memerlukan 2 lembar papan kayu jati belanda dan 2 hari kerja tim perakitan/finishing. ' +
      'Pak Hadi memiliki stok kayu sebanyak 120 lembar dan kuota hari kerja tukang maksimal 80 hari-orang. ' +
      'Keuntungan bersih dari 1 unit Meja Belajar adalah Rp 150.000 dan dari 1 unit Rak Buku adalah Rp 200.000. ' +
      'Bantulah Pak Hadi menentukan kombinasi produksi yang menghasilkan keuntungan puncak!',
    productX: {
      name: 'Meja Belajar Minimalis',
      unit: 'unit',
      profitOrCost: 150000,
    },
    productY: {
      name: 'Rak Buku 4 Tingkat',
      unit: 'unit',
      profitOrCost: 200000,
    },
    objectiveType: 'maximize',
    objectiveLabel: 'Memaksimalkan Keuntungan Mebel',
    constraints: [
      {
        id: 'c1',
        name: 'Stok Bahan Baku Papan Kayu',
        coeffX: 3,
        coeffY: 2,
        operator: '<=',
        capacity: 120,
        unit: 'lembar',
      },
      {
        id: 'c2',
        name: 'Kapasitas Waktu Perakitan & Finishing',
        coeffX: 1,
        coeffY: 2,
        operator: '<=',
        capacity: 80,
        unit: 'hari-orang',
      },
    ],
    tips: 'Perhatikan titik potong antara garis 3x + 2y = 120 dan x + 2y = 80.',
  },
  {
    id: 5,
    groupNumber: 5,
    businessName: 'NutriBox Catering Sehat',
    category: 'Katering Makanan Sehat',
    ownerName: 'Dokter Fira',
    story:
      'Dokter Fira merintis katering sehat "NutriBox" untuk pekerja kantoran. Katering ini menyediakan dua pilihan menu: Rice Bowl Rendang Diet dan Salad Wrap Dada Ayam. ' +
      'Satu porsi Rice Bowl Rendang membutuhkan 2 porsi daging protein dan 1 porsi sayuran organik segar. ' +
      'Satu porsi Salad Wrap membutuhkan 1 porsi daging protein dan 2 porsi sayuran organik segar. ' +
      'Persediaan bahan segar dari mitra petani lokal hari ini adalah 140 porsi protein dan 160 porsi sayuran organik. ' +
      'Keuntungan bersih untuk setiap porsi Rice Bowl Rendang adalah Rp 8.000 dan untuk Salad Wrap adalah Rp 10.000. ' +
      'Tentukan jumlah porsi masing-masing menu agar keuntungan harian NutriBox maksimal tanpa menyia-nyiakan bahan baku segar!',
    productX: {
      name: 'Rice Bowl Rendang Diet',
      unit: 'porsi',
      profitOrCost: 8000,
    },
    productY: {
      name: 'Salad Wrap Dada Ayam',
      unit: 'porsi',
      profitOrCost: 10000,
    },
    objectiveType: 'maximize',
    objectiveLabel: 'Memaksimalkan Keuntungan Katering',
    constraints: [
      {
        id: 'c1',
        name: 'Ketersediaan Daging Protein Berkualitas',
        coeffX: 2,
        coeffY: 1,
        operator: '<=',
        capacity: 140,
        unit: 'porsi',
      },
      {
        id: 'c2',
        name: 'Ketersediaan Sayuran Organik Segar',
        coeffX: 1,
        coeffY: 2,
        operator: '<=',
        capacity: 160,
        unit: 'porsi',
      },
    ],
    tips: 'Kendala protein: 2x + y <= 140. Kendala sayur: x + 2y <= 160.',
  },
  {
    id: 6,
    groupNumber: 6,
    businessName: 'Aroma Nusantara Artisan',
    category: 'Kerajinan Sabun & Lilin Herbal',
    ownerName: 'Mbak Dewi',
    story:
      'Mbak Dewi memproduksi suvenir ramah lingkungan di studio "Aroma Nusantara Artisan". Dua produk andalannya adalah Lilin Aromaterapi Soywax dan Sabun Herbal Minyak Zaitun. ' +
      'Setiap 1 buah Lilin Aromaterapi membutuhkan 3 ml minyak esensial atsiri murni dan 1 jam penggunaan cetakan khusus. ' +
      'Setiap 1 buah Sabun Herbal membutuhkan 2 ml minyak esensial atsiri murni dan 2 jam penggunaan cetakan khusus. ' +
      'Persediaan minyak esensial yang ada adalah 180 ml dan kapasitas cetakan yang tersedia dalam satu batch adalah 100 jam cetak. ' +
      'Keuntungan yang didapat Mbak Dewi adalah Rp 12.000 untuk setiap lilin aromaterapi dan Rp 15.000 untuk setiap sabun herbal. ' +
      'Bantulah Mbak Dewi menghitung target produksi terbaik menggunakan metode grafik daerah penyelesaian!',
    productX: {
      name: 'Lilin Aromaterapi Soywax',
      unit: 'buah',
      profitOrCost: 12000,
    },
    productY: {
      name: 'Sabun Herbal Zaitun',
      unit: 'buah',
      profitOrCost: 15000,
    },
    objectiveType: 'maximize',
    objectiveLabel: 'Memaksimalkan Keuntungan Penjualan Suvenir',
    constraints: [
      {
        id: 'c1',
        name: 'Minyak Esensial Atsiri Murni',
        coeffX: 3,
        coeffY: 2,
        operator: '<=',
        capacity: 180,
        unit: 'ml',
      },
      {
        id: 'c2',
        name: 'Waktu Pemakaian Cetakan Khusus',
        coeffX: 1,
        coeffY: 2,
        operator: '<=',
        capacity: 100,
        unit: 'jam',
      },
    ],
    tips: 'Titik potong didapat dari eliminasi 3x + 2y = 180 dan x + 2y = 100.',
  },
];
