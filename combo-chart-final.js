/* Final visual layer for readable combination charts. */
(function () {
  const COMBO = {
    "air-minum": {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_KK_TIDAK_TERAKSES_AIR_MINUM_AMAN,
      line2: HEADER_SPREADSHEET.JUMLAH_KK_TIDAK_TERPENUHI_AIR_MINUM,
      labels: ["Jumlah KK", "Tidak Ada Akses Air Minum", "Tidak Terpenuhi Air Minum"],
      title: "TOTAL KK TANPA AKSES AIR MINUM"
    },
    drainase: {
      bar: HEADER_SPREADSHEET.PANJANG_DRAINASE_IDEAL,
      line1: HEADER_SPREADSHEET.PANJANG_DRAINASE_EKSISTING,
      line2: HEADER_SPREADSHEET.PANJANG_DRAINASE_RUSAK,
      labels: ["Panjang Drainase Lingkungan Ideal", "Panjang Drainase Lingkungan Eksisting", "Panjang Drainase Lingkungan dengan kondisi Rusak"],
      title: "DRAINASE LINGKUNGAN"
    },
    "air-limbah": {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_KK_TIDAK_TERAKSES_AIR_LIMBAH,
      line2: HEADER_SPREADSHEET.JUMLAH_KK_AIR_LIMBAH_TIDAK_SESUAI,
      labels: ["Jumlah KK", "Tidak Ada Akses Sistem Air Limbah", "Sarpras Air Limbah Tidak Sesuai"],
      title: "AIR LIMBAH/SANITASI"
    },
    persampahan: {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_KK_SISTEM_SAMPAH_TIDAK_SESUAI,
      line2: HEADER_SPREADSHEET.JUMLAH_KK_SARPRAS_SAMPAH_TIDAK_SESUAI,
      labels: ["Jumlah KK", "Sarpras Sampah Tidak Sesuai", "Sistem Sampah Tidak Sesuai"],
      title: "PENGELOLAAN PERSAMPAHAN"
    },
    "proteksi-kebakaran": {
      bar: HEADER_SPREADSHEET.JUMLAH_TOTAL_KK_STAT_ROW,
      line1: HEADER_SPREADSHEET.JUMLAH_BANGUNAN_TIDAK_TERLAYANI_PRASARANA,
      line2: HEADER_SPREADSHEET.JUMLAH_BANGUNAN_TIDAK_TERLAYANI_SARANA,
      labels: ["Jumlah KK", "Tidak Terlayani Prasarana Proteksi Kebakaran", "Tidak Terlayani Sarana Proteksi Kebakaran"],
      title: "PROTEKSI KEBAKARAN"
    }
  };

  const comboCategories = Object.keys(COMBO);
  const n = value => {
    const result = ubahMenjadiAngka(value);
    return Number.isFinite(result) && result > 0 ? result : 0;
  };
  const fmt = value => Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 2 });

  function getRows(config) {
    return filterDataKabKota(currentKabupaten).map(row => {
      const label = String(ambilNilaiSpreadsheet(row, HEADER_SPREADSHEET.NAMA_KAWASAN) || "").trim();
      if (!label) return null;
      return {
        label,
        bar: n(ambilNilaiSpreadsheet(row, config.bar)),
        line1: n(ambilNilaiSpreadsheet(row, config.line1)),
        line2: n(ambilNilaiSpreadsheet(row, config.line2))
      };
    }).filter(Boolean);
  }

  function empty(container) {
    container.innerHTML = "";
    const message = document.createElement("p");
    message.className = "chart-empty";
    message.textContent = "Tidak ada data";
    container.appendChild(message);
  }

  function svg(name, attrs) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function legendItem(markerClass, text) {
    const item = document.createElement("div");
    item.className = "combo-legend-item";
    const marker = document.createElement("span");
    marker.className = markerClass;
    const label = document.createElement("span");
    label.textContent = text;
    item.append(marker, label);
    return item;
  }

  function renderCombo(containerId, category) {
    const container = document.getElementById(containerId);
    const config = COMBO[category];
    if (!container || !config) return false;
    container.innerHTML = "";

    const rows = getRows(config);
    if (!rows.length || !rows.some(row => row.bar || row.line1 || row.line2)) {
      empty(container);
      return true;
    }

    const max = Math.max(...rows.flatMap(row => [row.bar, row.line1, row.line2]), 1);
    const plotHeight = 260;
    const lineHeight = 230;
    const chart = document.createElement("div");
    chart.className = "combo-chart";
    const plot = document.createElement("div");
    plot.className = "combo-plot";
    const bars = document.createElement("div");
    bars.className = "combo-bars";

    rows.forEach(row => {
      const item = document.createElement("div");
      item.className = "combo-bar-item";
      const value = document.createElement("span");
      value.className = "combo-bar-value";
      value.textContent = fmt(row.bar);
      const bar = document.createElement("span");
      bar.className = "combo-bar";
      bar.style.height = `${row.bar ? Math.max(3, row.bar / max * plotHeight) : 0}px`;
      const label = document.createElement("span");
      label.className = "combo-label";
      label.textContent = row.label;
      label.title = row.label;
      item.append(value, bar, label);
      bars.appendChild(item);
    });

    const lines = svg("svg", { class: "combo-lines", viewBox: `0 0 1000 ${lineHeight}`, preserveAspectRatio: "none" });
    [{ key: "line1", color: "#f28b2d", marker: "square" }, { key: "line2", color: "#e7c94e", marker: "triangle" }].forEach(series => {
      const points = rows.map((row, index) => ({
        x: (index + 0.5) / rows.length * 1000,
        y: lineHeight - row[series.key] / max * lineHeight,
        value: row[series.key]
      }));
      lines.appendChild(svg("polyline", {
        points: points.map(point => `${point.x},${point.y}`).join(" "),
        fill: "none", stroke: series.color, "stroke-width": "4",
        "stroke-linecap": "round", "stroke-linejoin": "round"
      }));
      points.forEach(point => {
        if (series.marker === "square") {
          lines.appendChild(svg("rect", { x: point.x - 7, y: point.y - 7, width: 14, height: 14, fill: series.color }));
        } else {
          lines.appendChild(svg("polygon", { points: `${point.x},${point.y - 9} ${point.x - 8},${point.y + 7} ${point.x + 8},${point.y + 7}`, fill: series.color }));
        }
        const text = svg("text", { x: point.x + 10, y: Math.max(12, point.y - 9), class: "combo-line-value" });
        text.textContent = fmt(point.value);
        lines.appendChild(text);
      });
    });

    plot.append(bars, lines);
    const legend = document.createElement("div");
    legend.className = "combo-chart-legend";
    legend.append(
      legendItem("combo-marker-bar", config.labels[0]),
      legendItem("combo-marker-orange", config.labels[1]),
      legendItem("combo-marker-yellow", config.labels[2])
    );
    chart.append(plot, legend);
    container.appendChild(chart);
    return true;
  }

  function updateTitle() {
    const config = COMBO[currentCategory];
    const titles = document.querySelectorAll(".chart-title");
    if (config && titles[0]) titles[0].textContent = config.title;
  }

  const originalRender = window.renderChart;
  window.renderChart = function (containerId, type, data, labels, title) {
    if (containerId === "chartKK" && COMBO[currentCategory]) {
      renderCombo(containerId, currentCategory);
      return;
    }
    if (typeof originalRender === "function") originalRender(containerId, type, data, labels, title);
  };

  const originalDashboard = window.tampilkanDashboard;
  window.tampilkanDashboard = function (...args) {
    if (typeof originalDashboard === "function") originalDashboard(...args);
    updateTitle();
    if (COMBO[currentCategory]) renderCombo("chartKK", currentCategory);
  };

  function refresh() {
    if (COMBO[currentCategory]) {
      updateTitle();
      renderCombo("chartKK", currentCategory);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(refresh, 0));
  else setTimeout(refresh, 0);
})();
