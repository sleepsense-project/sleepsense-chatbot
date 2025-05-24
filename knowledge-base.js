/**
 * SleepSense Knowledge Base - Extracted from Research Paper
 * Base untuk medical chatbot OSA monitoring system
 */

const sleepSenseKnowledge = {
  // Medical Information tentang OSA
  medical: {
    osa_definition: `
    Obstructive Sleep Apnea (OSA) adalah gangguan pernapasan akibat obstruksi 
    sebagian atau total pada saluran napas atas selama tidur, yang menyebabkan 
    episode hipopnea dan apnea intermiten. Kondisi ini terjadi akibat perubahan 
    tonus otot saluran napas selama tidur, terutama selama fase inspirasi, 
    yang menyebabkan penurunan saturasi oksigen arteri dan disregulasi otonom.
    `,
    
    global_prevalence: `
    Berdasarkan research SleepSense, lebih dari 1 miliar orang dewasa di dunia 
    mengalami OSA dengan Apnea-Hypopnea Index (AHI) ≥ 5/jam, dan lebih dari 
    425 juta orang menderita OSA sedang hingga berat (AHI ≥ 15/jam).
    `,
    
    indonesia_prevalence: `
    Di Indonesia, penelitian berbasis kuesioner Stop-Bang di lima wilayah Jakarta 
    mengungkap bahwa 49,5% dari 202 responden memiliki risiko OSA tinggi, 
    sementara studi berbasis polisomnografi (PSG) menunjukkan bahwa 52,5% 
    pengemudi taksi mengalami OSA.
    `,
    
    health_impact: `
    OSA memiliki implikasi serius terhadap kesehatan sistemik, meningkatkan risiko 
    hipertensi, penyakit jantung koroner, stroke, dan diabetes tipe 2, serta 
    menyebabkan penurunan fungsi kognitif akibat hipoksia intermiten dan stres 
    oksidatif yang merusak jaringan otak. Prevalensi depresi pada pasien OSA 
    dilaporkan mencapai 50%.
    `,
    
    underdiagnosis: `
    Lebih dari 85% pasien dengan OSA yang secara klinis signifikan tidak pernah 
    terdiagnosis. Hal ini terjadi karena banyak pasien tidak menyadari gejala 
    mereka, seperti mendengkur berat dan terbangun di malam hari.
    `
  },

  // Teknologi SleepSense
  technology: {
    overview: `
    SleepSense adalah sistem diagnosis OSA berbasis AI dan IoT yang memungkinkan 
    pemantauan ambulatory langsung di rumah pasien. Teknologi ini dirancang 
    agar non-invasif, portabel, dan tetap mempertahankan akurasi klinis tinggi.
    `,
    
    sensors: `
    SleepSense menggunakan sistem pemantauan gerakan dada berbasis sensor multimodal:
    - ECG (AD8232): Elektrokardiografi untuk aktivitas listrik jantung
    - SpO₂ (MAX30102): Saturasi oksigen perifer dan detak jantung  
    - Motion (MPU6050): Giroskop/akselerometer 6-axis untuk gerakan thorax
    - Sound (KY-038): Deteksi suara dengkuran sebagai indikator OSA
    - Piezoelectric: Mendeteksi pola pernapasan berdasarkan gerakan dada
    `,
    
    ai_technology: `
    Sistem SleepSense dilengkapi dengan model hybrid deep learning (CNN - 
    Convolutional Neural Network dan LSTM - Long Short-Term Memory) yang mampu 
    menganalisis pola pernapasan secara temporal, membedakan apnea, hypopnea, 
    dan pernapasan normal, serta mengklasifikasikan tingkat keparahan OSA.
    `,
    
    accuracy: `
    Berdasarkan penelitian, kombinasi fitur aliran napas dan saturasi oksigen 
    dapat menghasilkan akurasi 94% dalam mendeteksi apnea dan hypopnea, serta 
    mencapai akurasi 99% dalam skrining OSA dengan AUC 0,99. Dalam klasifikasi 
    tingkat keparahan OSA, model memiliki akurasi 93% dengan AUC 0,91.
    `,
    
    hardware_specs: `
    Komponen Hardware SleepSense:
    - Microcontroller: ESP32-S3 (dual-core, WiFi/BLE terintegrasi)
    - Power: Baterai Lithium Polymer 3.7V (2000mAh) dengan modul pengisian TP4056
    - Communication: WiFi/Bluetooth untuk transmisi data real-time
    - Housing: Material elastis tingkat medis, silikon hypoallergenic
    - Estimasi biaya prototype: ~IDR 978,300
    `
  },

  // Clinical Guidelines
  clinical: {
    ahi_classification: `
    Diagnosis OSA berdasarkan Apnea-Hypopnea Index (AHI):
    - AHI 5-14: OSA derajat ringan
    - AHI 15-29: OSA derajat sedang  
    - AHI ≥30: OSA derajat berat
    
    Hasil yang menunjukkan lima atau lebih episode obstruksi jalan napas per jam 
    tidur dianggap tegak untuk diagnosis OSA.
    `,
    
    psg_limitations: `
    Polysomnography (PSG) sebagai baku emas diagnosis OSA memiliki keterbatasan:
    - Biaya tinggi dan memerlukan fasilitas khusus laboratorium tidur
    - Tidak tersedia di semua rumah sakit
    - Pemeriksaan perlu dilakukan dalam periode lama sesuai jam tidur normal
    - Menyebabkan ketidaknyamanan bagi pasien
    `,
    
    sleepsense_advantages: `
    Keunggulan SleepSense dibandingkan PSG konvensional:
    - Non-invasif dan dapat dilakukan di rumah
    - Biaya lebih terjangkau dan accessible
    - Monitoring berkelanjutan tanpa mengganggu pola tidur
    - Real-time data transmission ke layanan kesehatan
    - Enkripsi end-to-end sesuai standar HIPAA dan GDPR
    `,
    
    when_consult_doctor: `
    Kapan harus konsultasi dokter spesialis:
    - Gejala OSA persisten (mendengkur berat, sesak saat tidur)
    - Hasil monitoring SleepSense menunjukkan AHI tinggi secara konsisten
    - Gejala depresi atau fatigue berlebihan
    - Tanda-tanda komplikasi kardiovaskular
    - Penurunan kualitas hidup yang signifikan
    `
  },

  // Device Usage & Troubleshooting
  device: {
    setup_guide: `
    Panduan Setup SleepSense:
    1. Pasang belt sensor di area thorax dengan posisi nyaman
    2. Attach pulse oximeter di jari (biasanya jari telunjuk)
    3. Pastikan koneksi WiFi/Bluetooth aktif dan stabil
    4. Buka dashboard aplikasi untuk monitoring real-time
    5. Lakukan kalibrasi sensor sebelum tidur
    6. Pastikan baterai device terisi penuh
    `,
    
    troubleshooting: `
    Troubleshooting SleepSense Device:
    - Jika sensor tidak merespons: Restart ESP32 dan check koneksi kabel
    - Signal quality buruk: Pastikan sensor terpasang dengan benar di kulit
    - Koneksi terputus: Check WiFi/Bluetooth dan restart aplikasi
    - Baterai cepat habis: Check PowerBoost module dan kualitas baterai
    - Data tidak akurat: Kalibrasi ulang sensor dan check positioning
    `,
    
    maintenance: `
    Maintenance Device SleepSense:
    - Bersihkan sensor secara rutin dengan alkohol 70%
    - Check kondisi belt dan housing sensor
    - Update firmware secara berkala
    - Monitor kondisi baterai dan ganti jika diperlukan
    - Backup data monitoring secara rutin
    `
  },

  // Safety & Disclaimers
  safety: {
    medical_disclaimer: `
    DISCLAIMER MEDIS PENTING:
    SleepSense adalah alat bantu screening dan monitoring, bukan pengganti 
    konsultasi medis profesional. Untuk diagnosis definitif OSA dan penentuan 
    terapi yang tepat, selalu konsultasikan dengan dokter spesialis pulmonologi 
    atau sleep medicine.
    `,
    
    emergency_guidance: `
    PERHATIAN - Kondisi yang Memerlukan Bantuan Medis Segera:
    - Sesak napas parah saat tidur atau bangun tidur
    - Nyeri dada yang persisten
    - Pusing berlebihan atau pingsan
    - Detak jantung tidak teratur yang ekstrem
    
    Jika mengalami gejala di atas, SEGERA hubungi dokter atau layanan 
    gawat darurat terdekat.
    `,
    
    device_safety: `
    Keamanan Penggunaan Device:
    - Device ini aman untuk penggunaan jangka panjang
    - Material yang digunakan bersifat hypoallergenic
    - Tidak ada radiasi berbahaya yang dipancarkan
    - Data kesehatan dienkripsi end-to-end
    - Tidak mengganggu alat pacu jantung atau device medis lainnya
    `
  }
};

// Utility functions untuk knowledge retrieval
const knowledgeUtils = {
  /**
   * Cari konten yang relevan berdasarkan user query
   */
  findRelevantKnowledge: function(query) {
    const queryLower = query.toLowerCase();
    const relevantSections = [];
    
    // Medical keywords
    const medicalKeywords = ['osa', 'sleep apnea', 'apnea', 'tidur', 'mendengkur', 'sesak'];
    // Technology keywords  
    const techKeywords = ['sleepsense', 'sensor', 'device', 'esp32', 'monitoring'];
    // Clinical keywords
    const clinicalKeywords = ['ahi', 'diagnosis', 'gejala', 'dokter', 'treatment'];
    // Device keywords
    const deviceKeywords = ['setup', 'install', 'troubleshoot', 'error', 'battery'];
    
    if (medicalKeywords.some(keyword => queryLower.includes(keyword))) {
      relevantSections.push(...Object.entries(sleepSenseKnowledge.medical));
    }
    
    if (techKeywords.some(keyword => queryLower.includes(keyword))) {
      relevantSections.push(...Object.entries(sleepSenseKnowledge.technology));
    }
    
    if (clinicalKeywords.some(keyword => queryLower.includes(keyword))) {
      relevantSections.push(...Object.entries(sleepSenseKnowledge.clinical));
    }
    
    if (deviceKeywords.some(keyword => queryLower.includes(keyword))) {
      relevantSections.push(...Object.entries(sleepSenseKnowledge.device));
    }
    
    // Always include safety info untuk medical queries
    if (queryLower.includes('diagnosis') || queryLower.includes('terapi') || queryLower.includes('treatment')) {
      relevantSections.push(...Object.entries(sleepSenseKnowledge.safety));
    }
    
    return relevantSections;
  },

  /**
   * Generate context string dari relevant knowledge
   */
  generateContext: function(relevantSections) {
    if (relevantSections.length === 0) {
      return "General information about OSA and SleepSense technology.";
    }
    
    return relevantSections
      .map(([key, content]) => `${key}: ${content}`)
      .join('\n\n');
  },

  /**
   * Classify user intent berdasarkan query
   */
  classifyIntent: function(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('error') || queryLower.includes('tidak berfungsi') || 
        queryLower.includes('masalah') || queryLower.includes('troubleshoot')) {
      return 'device_troubleshooting';
    }
    
    if (queryLower.includes('setup') || queryLower.includes('install') || 
        queryLower.includes('cara') || queryLower.includes('panduan')) {
      return 'device_setup';
    }
    
    if (queryLower.includes('diagnosis') || queryLower.includes('dokter') || 
        queryLower.includes('treatment') || queryLower.includes('terapi')) {
      return 'medical_guidance';
    }
    
    if (queryLower.includes('osa') || queryLower.includes('sleep apnea') || 
        queryLower.includes('apnea')) {
      return 'medical_education';
    }
    
    if (queryLower.includes('sleepsense') || queryLower.includes('teknologi') || 
        queryLower.includes('sensor')) {
      return 'technology_info';
    }
    
    return 'general_inquiry';
  }
};

module.exports = {
  sleepSenseKnowledge,
  knowledgeUtils
};