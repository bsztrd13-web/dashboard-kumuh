/* Grafik kombinasi bar + dua line untuk kategori prasarana */

(function () {
  const KONFIGURASI_GRAFIK_KOMBINASI = {
    "air-minum": {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_KK_TIDAK_TERAKSES_AIR_MINUM_AMAN,
      line2: HEADER_SPREADSHEET.JUMLAH_KK_TIDAK_TERPENUHI_AIR_MINUM,
      barLabel: "Jumlah KK",
      line1Label: "Tidak Ada Akses Air Minum",
      line2Label: "Tidak Terpenuhi Air Minum",
      title: "AIR MINUM"
    },
    drainase: {
      bar: HEADER_SPREADSHEET.PANJANG_DRAINASE_IDEAL,
      line1: HEADER_SPREADSHEET.PANJANG_DRAINASE_EKSISTING,
      line2: HEADER_SPREADSHEET.PANJANG_DRAINASE_RUSAK,
      barLabel: "Panjang Drainase Lingkungan Ideal",
      line1Label: "Panjang Drainase Lingkungan Eksisting",
      line2Label: "Panjang Drainase Lingkungan dengan kondisi Rusak",
      title: "DRAINASE LINGKUNGAN"
    },
    "air-limbah": {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_KK_TIDAK_TERAKSES_AIR_LIMBAH,
      line2: HEADER_SPREADSHEET.JUMLAH_KK_AIR_LIMBAH_TIDAK_SESUAI,
      barLabel: "Jumlah KK",
      line1Label: "Tidak Ada Akses Sistem Air Limbah",
      line2Label: "Sarpras Air Limbah Tidak Sesuai",
      title: "AIR LIMBAH/SANITASI"
    },
    persampahan: {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_KK_SISTEM_SAMPAH_TIDAK_SESUAI,
      line2: HEADER_SPREADSHEET.JUMLAH_KK_SARPRAS_SAMPAH_TIDAK_SESUAI,
      barLabel: "Jumlah KK",
      line1Label: "Sarpras Sampah Tidak Sesuai",
      line2Label: "Sistem Sampah Tidak Sesuai",
      title: "PENGELOLAAN PERSAMPAHAN"
    },
    "proteksi-kebakaran": {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_BANGUNAN_TIDAK_TERLAYANI_PRASARANA,
      line2: HEADER_SPREADSHEET.JUMLAH_BANGUNAN_TIDAK_TERLAYANI_SARANA,
      barLabel: "Jumlah KK",
      line1Label: "Tidak Terlayani Prasarana Proteksi Kebakaran",
      line2Label: "Tidak Terlayani Sarana Proteksi Kebakaran",
      title: "PROTEKSI KEBAKARAN"
    }
  };

  const KATEGORI_KOMBINASI = Object.keys(
    KONFIGURASI_GRAFIK_KOMBINASI
  );

  function angkaAman(nilai) {
    const angka = ubahMenjadiAngka(nilai);
    return Number.isFinite(angka) && angka > 0 ? angka : 0;
  }

  function dataKombinasi(konfigurasi) {
    return filterDataKabKota(currentKabupaten)
      .map((baris, index) => {
        const label = String(
          ambilNilaiSpreadsheet(
            baris,
            HEADER_SPREADSHEET.NAMA_KAWASAN
          ) || ""
        ).trim();

        if (!label) {
          return null;
        }

        return {
          label,
          nomor: index,
          bar: angkaAman(
            ambilNilaiSpreadsheet(baris, konfigurasi.bar)
          ),
          line1: angkaAman(
            ambilNilaiSpreadsheet(baris, konfigurasi.line1)
          ),
          line2: angkaAman(
            ambilNilaiSpreadsheet(baris, konfigurasi.line2)
          )
        };
      })
      .filter(Boolean);
  }

  function svgElemen(nama, atribut) {
    const elemen = document.createElementNS(
      "http://www.w3.org/2000/svg",
      nama
    );

    Object.entries(atribut).forEach(([kunci, nilai]) => {
      elemen.setAttribute(kunci, nilai);
    });

    return elemen;
  }

  function formatNilai(nilai) {
    return Number(nilai || 0).toLocaleString("id-ID", {
      maximumFractionDigits: 2
    });
  }

  function itemLegend(kelas, teks) {
    const item = document.createElement("div");
    item.className = "combo-legend-item";

    const marker = document.createElement("span");
    marker.className = kelas;

    const label = document.createElement("span");
    label.textContent = teks;

    item.append(marker, label);
    return item;
  }

  function buatGrafikKombinasi(containerId, namaKategori) {
    const container = document.getElementById(containerId);
    const konfigurasi = KONFIGURASI_GRAFIK_KOMBINASI[namaKategori];

    if (!container || !konfigurasi) {
      return false;
    }

    container.innerHTML = "";
    const data = dataKombinasi(konfigurasi);

    if (!data.length) {
      const kosong = document.createElement("p");
      kosong.className = "chart-empty";
      kosong.textContent = "Tidak ada data";
      container.appendChild(kosong);
      return true;
    }

    const nilaiMaksimum = Math.max(
      ...data.flatMap(item => [item.bar, item.line1, item.line2]),
      1
    );

    const grafik = document.createElement("div");
    grafik.className = "combo-chart";

    const plot = document.createElement("div");
    plot.className = "combo-plot";

    const bars = document.createElement("div");
    bars.className = "combo-bars";

    const tinggiMaksimum = 260;

    data.forEach(item => {
      const kolom = document.createElement("div");
      kolom.className = "combo-bar-item";

      const nilai = document.createElement("span");
      nilai.className = "combo-bar-value";
      nilai.textContent = formatNilai(item.bar);

      const bar = document.createElement("span");
      bar.className = "combo-bar";
      bar.style.height = `${Math.max(
        item.bar > 0 ? 2 : 0,
        (item.bar / nilaiMaksimum) * tinggiMaksimum
      )}px`;

      const label = document.createElement("span");
      label.className = "combo-label";
      label.textContent = item.label;
      label.title = item.label;

      kolom.append(nilai, bar, label);
      bars.appendChild(kolom);
    });

    const svg = svgElemen("svg", {
      class: "combo-lines",
      viewBox: "0 0 1000 300",
      preserveAspectRatio: "none",
      "aria-hidden": "true"
    });

    const garis = [
      {
        key: "line1",
        warna: "#f47b20",
        kelas: "combo-line-orange",
        marker: "square"
      },
      {
        key: "line2",
        warna: "#f5b400",
        kelas: "combo-line-yellow",
        marker: "triangle"
      }
    ];

    garis.forEach(gaya => {
      const titik = data.map((item, index) => ({
        x: ((index + 0.5) / data.length) * 1000,
        y: 280 - (item[gaya.key] / nilaiMaksimum) * 260,
        nilai: item[gaya.key]
      }));

      const polyline = svgElemen("polyline", {
        points: titik.map(item => `${item.x},${item.y}`).join(" "),
        class: `combo-line ${gaya.kelas}`,
        fill: "none",
        stroke: gaya.warna,
        "stroke-width": "4",
        "stroke-linejoin": "round",
        "stroke-linecap": "round"
      });
      svg.appendChild(polyline);

      titik.forEach(item => {
        if (gaya.marker === "square") {
          svg.appendChild(svgElemen("rect", {
            x: item.x - 7,
            y: item.y - 7,
            width: 14,
            height: 14,
            fill: gaya.warna,
            class: `combo-point ${gaya.kelas}`
          }));
        } else {
          svg.appendChild(svgElemen("polygon", {
            points: `${item.x},${item.y - 9} ${item.x - 8},${item.y + 7} ${item.x + 8},${item.y + 7}`,
            fill: gaya.warna,
            class: `combo-point ${gaya.kelas}`
          }));
        }

        const teks = svgElemen("text", {
          x: item.x + 10,
          y: Math.max(12, item.y - 8),
          class: `combo-line-value ${gaya.kelas}`,
          fill: "#333333"
        });
        teks.textContent = formatNilai(item.nilai);
        svg.appendChild(teks);
      });
    });

    plot.append(bars, svg);

    const legend = document.createElement("div");
    legend.className = "combo-chart-legend";
    legend.append(
      itemLegend("combo-marker-bar", konfigurasi.barLabel),
      itemLegend("combo-marker-orange", konfigurasi.line1Label),
      itemLegend("combo-marker-yellow", konfigurasi.line2Label)
    );

    grafik.append(plot, legend);
    container.appendChild(grafik);
    return true;
  }

  const renderChartLama = window.renderChart;
  const updateJudulLama = window.updateJudulGrafik;

  window.updateJudulGrafik = function (konfigurasi) {
    if (typeof updateJudulLama === "function") {
      updateJudulLama(konfigurasi);
    }

    const judul = document.querySelectorAll(".chart-title");
    const config = KONFIGURASI_GRAFIK_KOMBINASI[currentCategory];

    if (config && judul.length > 0) {
      judul[0].textContent = config.title;
    }
  };

  window.renderChart = function (
    containerId,
    tipeChart,
    dataArray,
    labels,
    judul
  ) {
    if (
      containerId === "chartKK" &&
      KATEGORI_KOMBINASI.includes(currentCategory)
    ) {
      buatGrafikKombinasi(containerId, currentCategory);
      return;
    }

    if (typeof renderChartLama === "function") {
      renderChartLama(
        containerId,
        tipeChart,
        dataArray,
        labels,
        judul
      );
    }
  };
})();
