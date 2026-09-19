console.log("Status PapaParse:", {
  tersedia: typeof Papa !== "undefined",
  dapatParse:
    typeof Papa !== "undefined" &&
    typeof Papa.parse === "function"
});

function cekKolomKategori(
  konfigurasi,
  namaKategori
) {
  console.log(
    `========== CEK KOLOM: ${namaKategori} ==========`
  );

  const daftarKolom = {
    statRowColumn:
      STAT_ROW_COLUMN,

    chart1Column:
      konfigurasi.chart1Column,

    chart2Column:
      konfigurasi.chart2Column,

    chart3Column:
      konfigurasi.chart3Column
  };

  console.table(daftarKolom);

  if (!semuaData.length) {
    return;
  }

  const headerSpreadsheet =
    Object.keys(semuaData[0]);

  Object.entries(daftarKolom).forEach(
    ([namaPemakaian, namaKolom]) => {
      if (
        typeof namaKolom !== "string" ||
        namaKolom.trim() === ""
      ) {
        console.error(
          `${namaPemakaian} kosong untuk kategori ${namaKategori}`
        );
        return;
      }

      const kolomDitemukan =
        headerSpreadsheet.some(header =>
          normalisasiHeader(header) ===
          normalisasiHeader(namaKolom)
        );

      if (!kolomDitemukan) {
        console.error(
          `Kolom tidak ditemukan untuk ${namaPemakaian}:`,
          namaKolom
        );
      } else {
        console.log(
          `✅ ${namaPemakaian}: ${namaKolom}`
        );
      }
    }
  );
}

// =====================================================
// KONFIGURASI SPREADSHEET
// =====================================================

const SPREADSHEET_ID =
  "2PACX-1vQHGxAQLqOyIceGjSf0-e0kR4Tvjlk2d9RqTKkVA_cWaMSPNYHRn2Wm017-hydKMg";

const SHEET_GID = "1694018568";

const SHEET_CSV_URL =
  `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub` +
  `?gid=${SHEET_GID}&single=true&output=csv`;


// =====================================================
// HEADER SPREADSHEET
// =====================================================
// Nama di bawah ini harus sama dengan header spreadsheet.
// Jika ada perubahan nama kolom, cukup ubah bagian ini.

const HEADER_SPREADSHEET = {
  NAMA_KAB_KOTA: "Nama Kab/Kota",
  NAMA_KAWASAN: "Nama Kawasan/Lokasi",
  KATEGORI: "Kategori",

  // Data kawasan kumuh
  JUMLAH_TOTAL_KK_STAT_ROW: "Jml Total KK",
  JUMLAH_TOTAL_KK_CHART: "Jml Total KK",
  LUAS_PERMUKIMAN_KUMUH: "Luas Permukiman Kumuh",

  // Keteraturan bangunan
  JUMLAH_TOTAL_BANGUNAN: "Jml Total Bangunan",
  BANGUNAN_TIDAK_TERATUR: "Jml Bangunan tidak memiliki keteraturan",
  BANGUNAN_TIDAK_MEMENUHI_TEKNIS:
    "Jml Bangunan tidak memenuhi persyaratan Teknis",

  // Jalan lingkungan
  PANJANG_JALAN_LINGKUNGAN:
    "Panjang Jalan Lingkungan (m)",
  PANJANG_JALAN_RUSAK:
    "Panjang Jalan Lingkungan dengan kondisi Rusak (m)",
  PANJANG_JALAN_EKSISTING:
    "Panjang Jalan Lingkungan eksisting (m)",

  // Air minum
  JUMLAH_KK_TIDAK_TERAKSES_AIR_MINUM_AMAN:
    "Jumlah KK tidak terakses air minum aman",
  JUMLAH_KK_TIDAK_TERPENUHI_AIR_MINUM:
    "Jumlah KK tidak terpenuhi Air Minum",

  // Drainase
  PANJANG_DRAINASE_IDEAL:
    "Panjang Drainase Lingkungan Ideal (m)",
  PANJANG_DRAINASE_RUSAK:
    "Panjang Drainase Lingkungan dengan kondisi Rusak (m)",
  PANJANG_DRAINASE_EKSISTING:
    "Panjang Drainase Lingkungan Eksisting (m)",

  // Air limbah
  JUMLAH_KK_TIDAK_TERAKSES_AIR_LIMBAH:
    "Jumlah KK tidak terakses sistem air limbah sesuai standar teknis",
  JUMLAH_KK_AIR_LIMBAH_TIDAK_SESUAI:
    "Jumlah KK dengan sarpras air limbah tdk sesuai persyaratan teknis",

  // Persampahan
  JUMLAH_KK_SISTEM_SAMPAH_TIDAK_SESUAI:
    "Jumlah KK dengan sarpras pengolahan sampah yang tdk sesuai persyaratan teknis",
  JUMLAH_KK_SARPRAS_SAMPAH_TIDAK_SESUAI:
    "Jumlah KK dg sistem pengolahan sampah tdk sesuai standar teknis",

  // Proteksi kebakaran
  JUMLAH_BANGUNAN_TIDAK_TERLAYANI_PRASARANA:
    "Jumlah bangunan tidak terlayani prasarana proteksi kebakaran",
  JUMLAH_BANGUNAN_TIDAK_TERLAYANI_SARANA:
    "Jumlah bangunan tidak terlayani sarana proteksi kebakaran"
};

const STAT_ROW_COLUMN =
  HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW;


// =====================================================
// VARIABEL GLOBAL
// =====================================================

let semuaData = [];
let currentCategory = "kumuh";
let currentKabupaten = "semua";
let dataInitialized = false;
let pilihKabKotaListenerSetup = false;
const chartAktif = {};


// =====================================================
// KONFIGURASI DASHBOARD
// =====================================================

const KATEGORI_DASHBOARD = {
  kumuh: {
    chart1Column:
      HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_CHART,

    chart2Column:
      HEADER_SPREADSHEET.LUAS_PERMUKIMAN_KUMUH,

    chart3Column:
      HEADER_SPREADSHEET.LUAS_PERMUKIMAN_KUMUH,

    chart1Type: "bar",
    chart2Type: "bar",
    chart3Type: "bar",

    chart1Label: "JUMLAH TOTAL KK",
    chart2Label:
      "LUASAN KAWASAN KUMUH RINGAN (Ha)",
    chart3Label:
      "LUASAN KAWASAN KUMUH SEDANG (Ha)"
  },

  "keteraturan-bangunan": {
    chart1Column:
      HEADER_SPREADSHEET.JUMLAH_TOTAL_BANGUNAN,

    chart2Column:
      HEADER_SPREADSHEET.BANGUNAN_TIDAK_TERATUR,

    chart3Column:
      HEADER_SPREADSHEET.BANGUNAN_TIDAK_MEMENUHI_TEKNIS,

    chart1Type: "bar",
    chart2Type: "pie",
    chart3Type: "pie",

    chart1Label: "JUMLAH TOTAL BANGUNAN",
    chart2Label:
      "BANGUNAN TIDAK MEMILIKI KETERATURAN",
    chart3Label:
      "BANGUNAN TIDAK SESUAI TEKNIS"
  },

  "jalan-lingkungan": {
    chart1Column:
      HEADER_SPREADSHEET.PANJANG_JALAN_LINGKUNGAN,

    chart2Column:
      HEADER_SPREADSHEET.PANJANG_JALAN_RUSAK,

    chart3Column:
      HEADER_SPREADSHEET.PANJANG_JALAN_EKSISTING,

    chart1Type: "bar",
    chart2Type: "bar",
    chart3Type: "pie",

    chart1Label: "PANJANG TOTAL JALAN (m)",
    chart2Label: "PANJANG JALAN RUSAK (m)",
    chart3Label: "PANJANG JALAN EKSISTING (m)"
  },

  "air-minum": {
    chart1Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_TIDAK_TERAKSES_AIR_MINUM_AMAN,

    chart2Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_TIDAK_TERAKSES_AIR_MINUM_AMAN,

    chart3Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_TIDAK_TERPENUHI_AIR_MINUM,

    chart1Type: "bar",
    chart2Type: "pie",
    chart3Type: "pie",

    chart1Label: "TOTAL KK TANPA AKSES AIR MINUM",
    chart2Label:
      "KK TIDAK TERAKSES AIR MINUM AMAN",
    chart3Label:
      "KK TIDAK TERPENUHI AIR MINUM"
  },

  drainase: {
    chart1Column:
      HEADER_SPREADSHEET.PANJANG_DRAINASE_IDEAL,

    chart2Column:
      HEADER_SPREADSHEET.PANJANG_DRAINASE_RUSAK,

    chart3Column:
      HEADER_SPREADSHEET.PANJANG_DRAINASE_EKSISTING,

    chart1Type: "bar",
    chart2Type: "bar",
    chart3Type: "pie",

    chart1Label: "PANJANG DRAINASE IDEAL (m)",
    chart2Label: "PANJANG DRAINASE RUSAK (m)",
    chart3Label:
      "PANJANG DRAINASE EKSISTING (m)"
  },

  "air-limbah": {
    chart1Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_TIDAK_TERAKSES_AIR_LIMBAH,

    chart2Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_TIDAK_TERAKSES_AIR_LIMBAH,

    chart3Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_AIR_LIMBAH_TIDAK_SESUAI,

    chart1Type: "bar",
    chart2Type: "bar",
    chart3Type: "pie",

    chart1Label:
      "TOTAL KK TANPA SISTEM AIR LIMBAH",

    chart2Label:
      "KK TIDAK TERAKSES SISTEM AIR LIMBAH",

    chart3Label:
      "KK DENGAN SARPRAS AIR LIMBAH TIDAK SESUAI"
  },

  persampahan: {
    chart1Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_SISTEM_SAMPAH_TIDAK_SESUAI,

    chart2Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_SARPRAS_SAMPAH_TIDAK_SESUAI,

    chart3Column:
      HEADER_SPREADSHEET
        .JUMLAH_KK_SISTEM_SAMPAH_TIDAK_SESUAI,

    chart1Type: "bar",
    chart2Type: "pie",
    chart3Type: "pie",

    chart1Label:
      "TOTAL KK TANPA SISTEM SAMPAH SESUAI",

    chart2Label:
      "KK DENGAN SARPRAS SAMPAH TIDAK SESUAI",

    chart3Label:
      "KK DENGAN SISTEM SAMPAH TIDAK SESUAI"
  },

  "proteksi-kebakaran": {
    chart1Column:
      HEADER_SPREADSHEET
        .JUMLAH_BANGUNAN_TIDAK_TERLAYANI_PRASARANA,

    chart2Column:
      HEADER_SPREADSHEET
        .JUMLAH_BANGUNAN_TIDAK_TERLAYANI_PRASARANA,

    chart3Column:
      HEADER_SPREADSHEET
        .JUMLAH_BANGUNAN_TIDAK_TERLAYANI_SARANA,

    chart1Type: "bar",
    chart2Type: "pie",
    chart3Type: "pie",

    chart1Label: "TOTAL BANGUNAN TANPA PROTEKSI",
    chart2Label:
      "BANGUNAN TIDAK TERLAYANI PRASARANA",
    chart3Label:
      "BANGUNAN TIDAK TERLAYANI SARANA"
  }
};


// =====================================================
// FUNGSI NORMALISASI HEADER
// =====================================================

function normalisasiHeader(namaHeader) {
  return String(namaHeader || "")
    .replace(/^\uFEFF/, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}


// =====================================================
// MENCARI HEADER YANG BENAR DI DATA
// =====================================================

function cariNamaHeaderYangBenar(dataBaris, namaHeaderYangDicari) {
  if (!dataBaris || !namaHeaderYangDicari) {
    return null;
  }

  const target = normalisasiHeader(namaHeaderYangDicari);

  return (
    Object.keys(dataBaris).find(
      namaHeader =>
        normalisasiHeader(namaHeader) === target
    ) || null
  );
}


// =====================================================
// MENGAMBIL NILAI BERDASARKAN HEADER SPREADSHEET
// =====================================================

function ambilNilaiSpreadsheet(
  dataBaris,
  namaHeader
) {
  if (!dataBaris || !namaHeader) {
    console.error(
      "Data baris atau nama header kosong:",
      {
        dataBaris,
        namaHeader
      }
    );

    return "";
  }

  const namaHeaderYangBenar =
    Object.keys(dataBaris).find(
      namaHeaderDariCSV =>
        normalisasiHeader(
          namaHeaderDariCSV
        ) ===
        normalisasiHeader(
          namaHeader
        )
    );

  if (!namaHeaderYangBenar) {
    console.error(
      "Header tidak ditemukan:",
      namaHeader,
      "Header yang tersedia:",
      Object.keys(dataBaris)
    );

    return "";
  }

  return dataBaris[namaHeaderYangBenar];
}


// =====================================================
// KONVERSI NILAI MENJADI ANGKA
// =====================================================

function ubahMenjadiAngka(nilaiSpreadsheet) {
  // Nilai kosong
  if (
    nilaiSpreadsheet === null ||
    nilaiSpreadsheet === undefined
  ) {
    return 0;
  }

  // Jika sudah berupa angka
  if (typeof nilaiSpreadsheet === "number") {
    return Number.isFinite(nilaiSpreadsheet)
      ? nilaiSpreadsheet
      : 0;
  }

  let nilaiText = String(nilaiSpreadsheet)
    .replace(/^\uFEFF/, "")
    .replace(/\u00A0/g, " ")
    .trim();

  // Nilai kosong setelah dibersihkan
  if (nilaiText === "") {
    return 0;
  }

  /*
    Contoh nilai yang didukung:

    "0"       -> 0
    "00%"     -> 0
    "100"     -> 100
    "2.10"    -> 2.10
    "4,66"    -> 4.66
    "1.234,56"-> 1234.56
    "100%"    -> 100
  */

  // Hapus simbol persen
  // Untuk kebutuhan dashboard, 100% dibaca sebagai 100,
  // bukan 1.
  nilaiText = nilaiText.replace(/%/g, "");

  // Hapus spasi
  nilaiText = nilaiText.replace(/\s/g, "");

  // Hanya angka biasa
  if (/^-?\d+$/.test(nilaiText)) {
    return Number(nilaiText);
  }

  // Angka desimal dengan koma, contoh: 4,66
  if (/^-?\d+,\d+$/.test(nilaiText)) {
    const nilaiAngka = Number(
      nilaiText.replace(",", ".")
    );

    return Number.isFinite(nilaiAngka)
      ? nilaiAngka
      : 0;
  }

  // Angka desimal dengan titik, contoh: 2.10
  if (/^-?\d+\.\d+$/.test(nilaiText)) {
    const nilaiAngka = Number(nilaiText);

    return Number.isFinite(nilaiAngka)
      ? nilaiAngka
      : 0;
  }

  // Format ribuan Indonesia, contoh: 1.234 atau 1.234,56
  if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(nilaiText)) {
    const nilaiAngka = Number(
      nilaiText
        .replace(/\./g, "")
        .replace(",", ".")
    );

    return Number.isFinite(nilaiAngka)
      ? nilaiAngka
      : 0;
  }

  // Format angka ribuan tanpa desimal, contoh: 1.234
  if (/^-?\d{1,3}(\.\d{3})+$/.test(nilaiText)) {
    const nilaiAngka = Number(
      nilaiText.replace(/\./g, "")
    );

    return Number.isFinite(nilaiAngka)
      ? nilaiAngka
      : 0;
  }

  // Fallback terakhir untuk nilai yang masih mengandung simbol lain
  const nilaiBersih = nilaiText.replace(
    /[^0-9,.-]/g,
    ""
  );

  let nilaiFallback = nilaiBersih;

  if (
    nilaiFallback.includes(".") &&
    nilaiFallback.includes(",")
  ) {
    nilaiFallback = nilaiFallback
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (
    nilaiFallback.includes(",")
  ) {
    nilaiFallback = nilaiFallback.replace(",", ".");
  }

  const hasilFallback = Number(nilaiFallback);

  if (Number.isFinite(hasilFallback)) {
    return hasilFallback;
  }

  console.warn(
    "Nilai benar-benar tidak dapat dibaca sebagai angka:",
    JSON.stringify(nilaiSpreadsheet)
  );

  return 0;
}


function formatAngka(nilai) {
  return Number(nilai || 0).toLocaleString("id-ID");
}

function formatAngkaBulat(nilai) {
  return Math.round(Number(nilai || 0)).toLocaleString("id-ID");
}

// =====================================================
// NORMALISASI KATEGORI
// =====================================================

function normalisasiKategori(nilaiKategori) {
  return String(nilaiKategori || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


function kategoriAdalah(nilaiKategori, kategoriTujuan) {
  const kategori = normalisasiKategori(nilaiKategori);

  if (kategori === kategoriTujuan) {
    return true;
  }

  if (
    kategori.includes(kategoriTujuan) &&
    !kategori.includes("tidak")
  ) {
    return true;
  }

  return false;
}


// =====================================================
// PEMERIKSAAN HEADER SPREADSHEET
// =====================================================

function periksaHeaderSpreadsheet() {
  if (!semuaData.length) {
    console.warn("Belum ada data spreadsheet.");
    return;
  }

  const headerYangTersedia = Object.keys(semuaData[0]);

  console.log("========== HEADER SPREADSHEET ==========");
  console.table(headerYangTersedia);

  console.log("========== HEADER YANG DIGUNAKAN ==========");
  console.table(HEADER_SPREADSHEET);

  const headerTidakDitemukan = [];

  Object.entries(HEADER_SPREADSHEET).forEach(
    ([namaKonstanta, namaHeader]) => {
      const ditemukan = headerYangTersedia.some(
        headerTersedia =>
          normalisasiHeader(headerTersedia) ===
          normalisasiHeader(namaHeader)
      );

      if (!ditemukan) {
        headerTidakDitemukan.push({
          konstanta: namaKonstanta,
          header: namaHeader
        });
      }
    }
  );

  if (headerTidakDitemukan.length > 0) {
    console.warn(
      "Header berikut tidak ditemukan di spreadsheet:"
    );
    console.table(headerTidakDitemukan);
  } else {
    console.log("✅ Semua header ditemukan.");
  }
}


// =====================================================
// PEMERIKSAAN CONTOH DATA
// =====================================================

function tampilkanContohData() {
  if (!semuaData.length) {
    return;
  }

  const barisPertama = semuaData[0];

  console.log(
    "========== CONTOH DATA SPREADSHEET =========="
  );

  console.table({
    namaKabKota: ambilNilaiSpreadsheet(
      barisPertama,
      HEADER_SPREADSHEET.NAMA_KAB_KOTA
    ),

    namaKawasan: ambilNilaiSpreadsheet(
      barisPertama,
      HEADER_SPREADSHEET.NAMA_KAWASAN
    ),

    kategori: ambilNilaiSpreadsheet(
      barisPertama,
      HEADER_SPREADSHEET.KATEGORI
    ),

    jumlahTotalKK: ambilNilaiSpreadsheet(
      barisPertama,
      HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW
    ),

    luasPermukimanKumuh: ambilNilaiSpreadsheet(
      barisPertama,
      HEADER_SPREADSHEET.LUAS_PERMUKIMAN_KUMUH
    )
  });
}


// =====================================================
// PARSE CSV
// =====================================================

function parseCSV(csvText) {
  if (
    typeof Papa !== "undefined" &&
    typeof Papa.parse === "function"
  ) {
    console.log("✅ CSV dibaca menggunakan PapaParse");

    return Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: function (header) {
        return String(header || "")
          .replace(/^\uFEFF/, "")
          .replace(/\u00A0/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    });
  }

  console.warn(
    "⚠️ PapaParse tidak tersedia. Menggunakan parser cadangan."
  );

  return parseCSVManual(csvText);
}

function parseCSVManual(csvText) {
  const semuaBaris = [];
  let baris = [];
  let nilai = "";
  let dalamKutipan = false;

  for (let i = 0; i < csvText.length; i++) {
    const karakter = csvText[i];
    const berikutnya = csvText[i + 1];

    if (karakter === '"') {
      if (
        dalamKutipan &&
        berikutnya === '"'
      ) {
        nilai += '"';
        i++;
      } else {
        dalamKutipan = !dalamKutipan;
      }

      continue;
    }

    if (
      karakter === "," &&
      !dalamKutipan
    ) {
      baris.push(nilai);
      nilai = "";
      continue;
    }

    if (
      (karakter === "\n" ||
        karakter === "\r") &&
      !dalamKutipan
    ) {
      if (
        karakter === "\r" &&
        berikutnya === "\n"
      ) {
        i++;
      }

      baris.push(nilai);
      nilai = "";

      if (
        baris.some(
          item => String(item).trim() !== ""
        )
      ) {
        semuaBaris.push(baris);
      }

      baris = [];
      continue;
    }

    nilai += karakter;
  }

  if (
    nilai !== "" ||
    baris.length > 0
  ) {
    baris.push(nilai);

    if (
      baris.some(
        item => String(item).trim() !== ""
      )
    ) {
      semuaBaris.push(baris);
    }
  }

  if (semuaBaris.length === 0) {
    return {
      data: [],
      errors: []
    };
  }

  const header = semuaBaris[0].map(namaHeader =>
    String(namaHeader || "")
      .replace(/^\uFEFF/, "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  const data = semuaBaris.slice(1).map(barisData => {
    const dataObjek = {};

    header.forEach((namaHeader, index) => {
      dataObjek[namaHeader] =
        barisData[index] !== undefined
          ? String(barisData[index]).trim()
          : "";
    });

    return dataObjek;
  });

  return {
    data,
    errors: []
  };
}

// =====================================================
// MENGAMBIL DATA SPREADSHEET
// =====================================================

async function ambilDataSpreadsheet() {
  try {
    console.log("📥 Mengambil data spreadsheet...");

    const urlData =
      `${SHEET_CSV_URL}&t=${Date.now()}`;

    const response = await fetch(urlData, {
      method: "GET",
      mode: "cors",
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}`
      );
    }

    const csvText = await response.text();

    if (!csvText || csvText.length < 10) {
      throw new Error(
        "Data CSV kosong atau terlalu kecil."
      );
    }

    const hasilParse = parseCSV(csvText);

    semuaData = Array.isArray(hasilParse.data)
      ? hasilParse.data
      : [];

    console.log(
      `✅ ${semuaData.length} baris data berhasil dimuat.`
    );

    if (!semuaData.length) {
      throw new Error(
        "Tidak ada baris data yang dapat dibaca."
      );
    }

    periksaHeaderSpreadsheet();
    tampilkanContohData();
    isiPilihanKabKota();

    if (!dataInitialized) {
      tampilkanDashboard(
        "semua",
        "kumuh",
        true
      );

      dataInitialized = true;
      pasangEventMenu();
    } else {
      tampilkanDashboard(
        currentKabupaten,
        currentCategory,
        true
      );
    }

  } catch (error) {
    console.error(
      "❌ Gagal mengambil data spreadsheet:",
      error
    );

    tampilkanError(
      `Gagal mengambil data spreadsheet: ${error.message}`
    );
  }
}


// =====================================================
// MENGISI PILIHAN KABUPATEN/KOTA
// =====================================================

function isiPilihanKabKota() {
  const selectKabKota =
    document.getElementById("pilihKabKota");

  if (!selectKabKota) {
    console.warn(
      "Elemen #pilihKabKota tidak ditemukan."
    );
    return;
  }

  const daftarKabKota = semuaData
    .map(dataBaris =>
      ambilNilaiSpreadsheet(
        dataBaris,
        HEADER_SPREADSHEET.NAMA_KAB_KOTA
      )
    )
    .map(nilai => String(nilai || "").trim())
    .filter(nilai => nilai !== "");

  const kabKotaUnik = [
    ...new Set(daftarKabKota)
  ].sort((a, b) =>
    a.localeCompare(b, "id")
  );

  console.log("========== DAFTAR KAB/KOTA ==========");
  console.table(kabKotaUnik);

  let optionsHTML =
    `<option value="semua">Semua Kab/Kota</option>`;

  kabKotaUnik.forEach(namaKabKota => {
    optionsHTML +=
      `<option value="${namaKabKota}">` +
      `${namaKabKota}` +
      `</option>`;
  });

  selectKabKota.innerHTML = optionsHTML;

  const kabupatenMasihTersedia =
    currentKabupaten === "semua" ||
    kabKotaUnik.includes(currentKabupaten);

  selectKabKota.value =
    kabupatenMasihTersedia
      ? currentKabupaten
      : "semua";

  if (!pilihKabKotaListenerSetup) {
    selectKabKota.addEventListener(
      "change",
      event => {
        currentKabupaten =
          event.target.value;

        tampilkanDashboard(
          currentKabupaten,
          currentCategory,
          true
        );
      }
    );

    pilihKabKotaListenerSetup = true;
  }
}


// =====================================================
// FILTER DATA BERDASARKAN KABUPATEN/KOTA
// =====================================================

function filterDataKabKota(namaKabKota) {
  if (
    !namaKabKota ||
    namaKabKota === "semua"
  ) {
    return semuaData;
  }

  return semuaData.filter(dataBaris => {
    const kabKotaSpreadsheet =
      String(
        ambilNilaiSpreadsheet(
          dataBaris,
          HEADER_SPREADSHEET.NAMA_KAB_KOTA
        ) || ""
      ).trim();

    return kabKotaSpreadsheet === namaKabKota;
  });
}


// =====================================================
// MENGHITUNG DATA DASHBOARD
// =====================================================

function hitungDataDashboard(
  dataTerpilih,
  konfigurasi
) {
  let totalStatRow = 0;

  let totalRingan = 0;
  let totalSedang = 0;
  let totalBerat = 0;
  let jumlahKawasan = 0;

  const namaRingan = [];
  const namaSedang = [];

  const dataChartKK = [];
  const labelChartKK = [];

  const dataChartRingan = [];
  const labelChartRingan = [];

  const dataChartSedang = [];
  const labelChartSedang = [];

  dataTerpilih.forEach((dataBaris, index) => {
    const namaKawasan = String(
      ambilNilaiSpreadsheet(
        dataBaris,
        HEADER_SPREADSHEET.NAMA_KAWASAN
      ) || ""
    ).trim();

    const nilaiKategori =
      ambilNilaiSpreadsheet(
        dataBaris,
        HEADER_SPREADSHEET.KATEGORI
      );

    // =================================================
    // 1. NILAI UNTUK STAT ROW
    // =================================================

    const nilaiStatRowSpreadsheet =
      ambilNilaiSpreadsheet(
        dataBaris,
        STAT_ROW_COLUMN
      );

    const nilaiStatRow =
      ubahMenjadiAngka(
        nilaiStatRowSpreadsheet,
      );

    totalStatRow += nilaiStatRow;
    totalStatRow += nilaiStatRow;

    /*
      Stat Row dihitung sebelum pemeriksaan nama kawasan.

      Dengan demikian, jika kolom Jml Total KK
      memiliki nilai tetapi Nama Kawasan/Lokasi kosong,
      nilai KK tetap masuk ke total Stat Row.
    */
    totalStatRow += nilaiStatRow;

    // =================================================
    // 2. NILAI UNTUK CHART AREA
    // =================================================

    const nilaiChartKKSpreadsheet =
      ambilNilaiSpreadsheet(
        dataBaris,
        konfigurasi.chart1Column
      );

    const nilaiChartKK =
      ubahMenjadiAngka(
        nilaiChartKKSpreadsheet,
        konfigurasi.chart1Column
      );

    /*
      Chart membutuhkan label nama kawasan.
      Karena itu, baris tanpa nama kawasan
      tidak dimasukkan ke Chart Area.
    */
    if (!namaKawasan) {
      console.warn(
        "Baris tidak masuk Chart Area karena Nama Kawasan/Lokasi kosong:",
        {
          nomorBaris: index + 2,
          nilaiStatRowSpreadsheet,
          nilaiStatRow,
          nilaiChartKKSpreadsheet,
          nilaiChartKK
        }
      );

      return;
    }

    jumlahKawasan++;

    dataChartKK.push(nilaiChartKK);
    labelChartKK.push(namaKawasan);

    // =================================================
    // 3. NILAI KATEGORI
    // =================================================

    const kategori =
      normalisasiKategori(nilaiKategori);

    const nilaiChart2Spreadsheet =
      ambilNilaiSpreadsheet(
        dataBaris,
        konfigurasi.chart2Column
      );

    const nilaiChart3Spreadsheet =
      ambilNilaiSpreadsheet(
        dataBaris,
        konfigurasi.chart3Column
      );

    const nilaiChart2 =
      ubahMenjadiAngka(
        nilaiChart2Spreadsheet,
        konfigurasi.chart2Column
      );

    const nilaiChart3 =
      ubahMenjadiAngka(
        nilaiChart3Spreadsheet,
        konfigurasi.chart3Column
      );

    // =================================================
    // 4. KATEGORI KUMUH
    // =================================================

    if (currentCategory === "kumuh") {
      if (
        kategoriAdalah(
          nilaiKategori,
          "ringan"
        )
      ) {
        totalRingan++;
        namaRingan.push(namaKawasan);

        dataChartRingan.push(nilaiChart2);
        labelChartRingan.push(namaKawasan);
      }

      else if (
        kategoriAdalah(
          nilaiKategori,
          "sedang"
        )
      ) {
        totalSedang++;
        namaSedang.push(namaKawasan);

        dataChartSedang.push(nilaiChart3);
        labelChartSedang.push(namaKawasan);
      }

      else if (
        kategoriAdalah(
          nilaiKategori,
          "berat"
        )
      ) {
        totalBerat++;
      }
    }

    if (currentCategory !== "kumuh") {
      if (nilaiChart2 > 0) {
        dataChartRingan.push(nilaiChart2);
        labelChartRingan.push(namaKawasan);
      }

      if (nilaiChart3 > 0) {
        dataChartSedang.push(nilaiChart3);
        labelChartSedang.push(namaKawasan);
      }
    }

    // =================================================
    // 5. TRACE DATA
    // =================================================

    if (index < 10) {
      console.log(
        "========== TRACE JUMLAH KK =========="
      );

      console.table({
        nomorBarisSpreadsheet: index + 2,

        namaKawasan,

        headerStatRow:
          STAT_ROW_COLUMN,

        nilaiStatRowSpreadsheet,

        nilaiStatRow,

        headerChartKK:
          konfigurasi.chart1Column,

        nilaiChartKKSpreadsheet,

        nilaiChartKK
      });
    }
  });

  console.log(
    "========== HASIL TOTAL JUMLAH KK =========="
  );

  console.table({
    totalStatRow,
    jumlahDataChart: dataChartKK.length,
    jumlahKawasan
  });

  return {
    totalStatRow,

    totalRingan,
    totalSedang,
    totalBerat,
    jumlahKawasan,

    namaRingan,
    namaSedang,

    dataChartKK,
    labelChartKK,

    dataChartRingan,
    labelChartRingan,

    dataChartSedang,
    labelChartSedang
  };
}


// =====================================================
// GRAFIK HTML/CSS
// =====================================================

const WARNA_PIE = [
  "#f47b42",
  "#ef5350",
  "#d9d84a",
  "#62b447",
  "#a8ad3f",
  "#3b82f6",
  "#8b5cf6",
  "#0891b2",
  "#db2777",
  "#65a30d"
];

function buatElemenGrafikKosong(container, pesan = "Tidak ada data") {
  container.innerHTML = "";

  const elemenKosong = document.createElement("p");
  elemenKosong.className = "chart-empty";
  elemenKosong.textContent = pesan;

  container.appendChild(elemenKosong);
}

function bersihkanContainerGrafik(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Container #${containerId} tidak ditemukan.`);
    return null;
  }

  container.innerHTML = "";
  return container;
}

function buatGrafikBar(
  containerId,
  dataArray,
  labels,
  judul
) {
  const container =
    bersihkanContainerGrafik(containerId);

  if (!container) {
    return;
  }

  const dataValid = [];

  dataArray.forEach((nilai, index) => {
    const angka = Number(nilai);

    if (
      Number.isFinite(angka) &&
      angka > 0
    ) {
      dataValid.push({
        nilai: angka,
        label: labels[index] || "Tanpa nama"
      });
    }
  });

  if (!dataValid.length) {
    buatElemenGrafikKosong(container);
    return;
  }

  const nilaiTerbesar = Math.max(
    ...dataValid.map(item => item.nilai)
  );

  const tinggiMaksimum = 220;

  const bars = document.createElement("div");
  bars.className = "bars";

  dataValid.forEach(item => {
    const barItem = document.createElement("div");
    barItem.className = "bar-item";

    const nilai = document.createElement("div");
    nilai.className = "nilai";
    nilai.textContent = formatAngkaDesimal(item.nilai);

    const bar = document.createElement("div");
    bar.className = "bar";

    const tinggiBar =
      nilaiTerbesar > 0
        ? (item.nilai / nilaiTerbesar) * tinggiMaksimum
        : 0;

    bar.style.setProperty(
      "--bar-height",
      `${Math.max(0, tinggiBar)}px`
    );

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = item.label;
    label.title = item.label;

    barItem.appendChild(nilai);
    barItem.appendChild(bar);
    barItem.appendChild(label);
    bars.appendChild(barItem);
  });

  container.appendChild(bars);
}

function buatGrafikPie(
  containerId,
  dataArray,
  labels,
  judul
) {
  const container =
    bersihkanContainerGrafik(containerId);

  if (!container) {
    return;
  }

  const dataValid = [];

  dataArray.forEach((nilai, index) => {
    const angka = Number(nilai);

    if (
      Number.isFinite(angka) &&
      angka > 0
    ) {
      dataValid.push({
        nilai: angka,
        label: labels[index] || "Tanpa nama"
      });
    }
  });

  const totalNilai = dataValid.reduce(
    (total, item) => total + item.nilai,
    0
  );

  if (!dataValid.length || totalNilai <= 0) {
    buatElemenGrafikKosong(container);
    return;
  }

  const pieWrapper = document.createElement("div");
  pieWrapper.className = "pie-wrapper";

  const pieChart = document.createElement("div");
  pieChart.className = "pie-chart";

  const pieLegend = document.createElement("div");
  pieLegend.className = "pie-legend";

  let sudutSaatIni = 0;
  const bagianPie = [];

  dataValid.forEach((item, index) => {
    const persentase =
      (item.nilai / totalNilai) * 100;

    const sudut =
      (item.nilai / totalNilai) * 360;

    const warna =
      WARNA_PIE[index % WARNA_PIE.length];

    // Celah putih antarbagian pie.
    const celah = dataValid.length > 1 ? 0.8 : 0;

    const sudutMulai =
      sudutSaatIni + celah / 2;

    const sudutAkhir =
      sudutSaatIni + sudut - celah / 2;

    bagianPie.push(
      `${warna} ${sudutMulai}deg ${sudutAkhir}deg`
    );

    sudutSaatIni += sudut;

    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";

    const legendColor = document.createElement("span");
    legendColor.className = "legend-color";
    legendColor.style.backgroundColor = warna;

    const legendLabel = document.createElement("span");
    legendLabel.className = "legend-label";

    legendLabel.textContent =
      `${item.label}: ` +
      `${formatAngkaDesimal(item.nilai)} ` +
      `(${persentase.toFixed(2)}%)`;

    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendLabel);
    pieLegend.appendChild(legendItem);
  });

  pieChart.style.background =
    `conic-gradient(${bagianPie.join(", ")})`;

  pieWrapper.appendChild(pieChart);
  pieWrapper.appendChild(pieLegend);
  container.appendChild(pieWrapper);
}

function renderChart(
  containerId,
  tipeChart,
  dataArray,
  labels,
  judul
) {
  if (tipeChart === "pie") {
    buatGrafikPie(
      containerId,
      dataArray,
      labels,
      judul
    );
  } else {
    buatGrafikBar(
      containerId,
      dataArray,
      labels,
      judul
    );
  }
}


// =====================================================
// UPDATE JUDUL GRAFIK
// =====================================================

function updateJudulGrafik(konfigurasi) {
  const daftarJudul =
    document.querySelectorAll(".chart-title");

  if (daftarJudul.length >= 3) {
    daftarJudul[0].textContent =
      konfigurasi.chart1Label;

    daftarJudul[1].textContent =
      konfigurasi.chart2Label;

    daftarJudul[2].textContent =
      konfigurasi.chart3Label;
  }
}


// =====================================================
// MENAMPILKAN DASHBOARD
// =====================================================

function hitungInformasiKabKota(dataTerpilih) {
  let totalKK = 0;
  let jumlahRingan = 0;
  let jumlahSedang = 0;
  let jumlahBerat = 0;

  const namaRingan = [];
  const namaSedang = [];

  dataTerpilih.forEach((dataBaris) => {
    const nilaiKKSpreadsheet =
      ambilNilaiSpreadsheet(
        dataBaris,
        STAT_ROW_COLUMN
      );

    const nilaiKK =
      ubahMenjadiAngka(
        nilaiKKSpreadsheet,
        STAT_ROW_COLUMN
      );

    totalKK += nilaiKK;

    const namaKawasan = String(
      ambilNilaiSpreadsheet(
        dataBaris,
        HEADER_SPREADSHEET.NAMA_KAWASAN
      ) || ""
    ).trim();

    if (!namaKawasan) {
      return;
    }

    const nilaiKategori =
      ambilNilaiSpreadsheet(
        dataBaris,
        HEADER_SPREADSHEET.KATEGORI
      );

    if (
      kategoriAdalah(
        nilaiKategori,
        "ringan"
      )
    ) {
      jumlahRingan++;
      namaRingan.push(namaKawasan);
    }

    else if (
      kategoriAdalah(
        nilaiKategori,
        "sedang"
      )
    ) {
      jumlahSedang++;
      namaSedang.push(namaKawasan);
    }

    else if (
      kategoriAdalah(
        nilaiKategori,
        "berat"
      )
    ) {
      jumlahBerat++;
    }
  });

  return {
    totalKK,
    jumlahRingan,
    jumlahSedang,
    jumlahBerat,
    namaRingan,
    namaSedang
  };
}

function updateInformasiKabKota(
  informasiKabKota
) {
  const elemenTotalKK =
    document.getElementById("totalKK");

  if (elemenTotalKK) {
    elemenTotalKK.textContent =
      formatAngkaBulat(
        informasiKabKota.totalKK
      );
  }

  const elemenJumlahRingan =
    document.getElementById("jumlahRingan");

  if (elemenJumlahRingan) {
    elemenJumlahRingan.textContent =
      informasiKabKota.jumlahRingan;
  }

  const elemenJumlahSedang =
    document.getElementById("jumlahSedang");

  if (elemenJumlahSedang) {
    elemenJumlahSedang.textContent =
      informasiKabKota.jumlahSedang;
  }

  const elemenJumlahBerat =
    document.getElementById("jumlahBerat");

  if (elemenJumlahBerat) {
    elemenJumlahBerat.textContent =
      informasiKabKota.jumlahBerat;
  }

  const elemenInfoRingan =
    document.getElementById("infoRingan");

  if (elemenInfoRingan) {
    elemenInfoRingan.textContent =
      informasiKabKota.namaRingan.length > 0
        ? informasiKabKota.namaRingan.join(" | ")
        : "Tidak ada";
  }

  const elemenInfoSedang =
    document.getElementById("infoSedang");

  if (elemenInfoSedang) {
    elemenInfoSedang.textContent =
      informasiKabKota.namaSedang.length > 0
        ? informasiKabKota.namaSedang.join(" | ")
        : "Tidak ada";
  }
}

function tampilkanDashboard(
  namaKabKota = currentKabupaten,
  namaKategori = currentCategory,
  perbaruiInformasiKabKota = false
) {
  const konfigurasi =
    KATEGORI_DASHBOARD[namaKategori];

  if (!konfigurasi) {
    console.error(
      "Konfigurasi kategori tidak ditemukan:",
      namaKategori
    );
    return;
  }

  // Simpan pilihan pengguna
  currentKabupaten = namaKabKota;
  currentCategory = namaKategori;

  // Pertahankan nilai select Kab/Kota
  const selectKabKota =
    document.getElementById("pilihKabKota");

  if (selectKabKota) {
    selectKabKota.value =
      currentKabupaten;
  }

  console.log(
    "========== DASHBOARD DIPERBARUI =========="
  );

  console.log({
    kabKota: currentKabupaten,
    kategori: currentCategory
  });

  // Filter berdasarkan Kab/Kota yang sedang dipilih
  const dataTerpilih =
    filterDataKabKota(currentKabupaten);

  if (perbaruiInformasiKabKota) {
    const informasiKabKota =
      hitungInformasiKabKota(dataTerpilih);

    updateInformasiKabKota(
      informasiKabKota
    );
  }
  
  console.log(
    "Jumlah baris data terpilih:",
    dataTerpilih.length
  );

  // Hitung data berdasarkan kategori menu
  const hasilPerhitungan =
    hitungDataDashboard(
      dataTerpilih,
      konfigurasi
    );

  console.log("TRACE DATA MENU", {
    kategori: currentCategory,
    statRowColumn: STAT_ROW_COLUMN,
    chart1Column: konfigurasi.chart1Column,
    chart2Column: konfigurasi.chart2Column,
    chart3Column: konfigurasi.chart3Column
  });

  // Hanya judul chart yang berubah mengikuti menu.
  // Judul pada stat-row tetap mengikuti HTML.
  updateJudulGrafik(konfigurasi);

  // Nama Kab/Kota pada header
  const namaKabupatenTampilan =
    currentKabupaten === "semua"
      ? "Sumatera Barat"
      : currentKabupaten;

  const elemenNamaKabupaten =
    document.getElementById("namaKabupaten");

  if (elemenNamaKabupaten) {
    elemenNamaKabupaten.textContent =
      namaKabupatenTampilan;
  }

  // Jumlah kawasan/data yang sesuai Kab/Kota
  const elemenTotalKawasan =
    document.getElementById(
      "totalKawasanHeader"
    );

  if (elemenTotalKawasan) {
    elemenTotalKawasan.textContent =
      hasilPerhitungan.jumlahKawasan;
  }

  // Tampilkan chart
  const areaGrafik =
    document.querySelector(".chart-area");

  if (areaGrafik) {
    areaGrafik.style.display = "grid";
  }

  renderChart(
    "chartKK",
    konfigurasi.chart1Type,
    hasilPerhitungan.dataChartKK,
    hasilPerhitungan.labelChartKK,
    konfigurasi.chart1Label
  );

  renderChart(
    "chartRingan",
    konfigurasi.chart2Type,
    hasilPerhitungan.dataChartRingan,
    hasilPerhitungan.labelChartRingan,
    konfigurasi.chart2Label
  );

  renderChart(
    "chartSedang",
    konfigurasi.chart3Type,
    hasilPerhitungan.dataChartSedang,
    hasilPerhitungan.labelChartSedang,
    konfigurasi.chart3Label
  );
}

function formatAngkaDesimal(nilai) {
  return Number(nilai || 0).toLocaleString(
    "id-ID",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

// =====================================================
// EVENT MENU
// =====================================================

function pasangEventMenu() {
  const daftarMenu =
    document.querySelectorAll(".menu-item");

  daftarMenu.forEach(itemMenu => {
    itemMenu.addEventListener(
      "click",
      event => {
        event.preventDefault();

        daftarMenu.forEach(menu => {
          menu.classList.remove("active");
        });

        itemMenu.classList.add("active");

        const kategori =
          itemMenu.getAttribute("data-category");

        if (!kategori) {
          return;
        }

        // Hanya chart yang berubah.
        // Informasi judul tetap.
        tampilkanDashboard(
          currentKabupaten,
          kategori,
          false
        );
      }
    );
  });

  const tombolHome =
    document.getElementById("homeBtn");

  if (tombolHome) {
    tombolHome.addEventListener(
      "click",
      event => {
        event.preventDefault();

        daftarMenu.forEach(menu => {
          menu.classList.remove("active");
        });

        // Home hanya mengganti chart ke kumuh.
        // Informasi judul tetap mengikuti Kab/Kota.
        tampilkanDashboard(
          currentKabupaten,
          "kumuh",
          false
        );
      }
    );
  }
}


// =====================================================
// PESAN ERROR
// =====================================================

function tampilkanError(pesanError) {
  const elemenContent =
    document.querySelector(".content");

  if (elemenContent) {
    elemenContent.innerHTML =
      `<div class="error-message">` +
      `❌ ${pesanError}` +
      `</div>`;
  }
}


// =====================================================
// INISIALISASI
// =====================================================

function mulaiDashboard() {
  console.log("✅ DOM siap digunakan.");
  ambilDataSpreadsheet();
}

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    mulaiDashboard
  );
} else {
  mulaiDashboard();
}