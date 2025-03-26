const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Укажите путь к FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Параметры сжатия
const inputDir = 'C:\\Users\\Dmitriy\\Videos\\S.T.A.L.K.E.R.  Call of Pripyat'; // Укажите путь к папке
const fps = 30;
const videoBitrate = '5000k';
const audioBitrate = '128k';
const resolution = '1280x720';

// Функция сжатия видео
function compressVideo(inputPath, outputPath) {
  ffmpeg(inputPath)
    .videoCodec('libx264')
    .audioCodec('aac')
    .outputOptions([
      `-r ${fps}`,
      `-b:v ${videoBitrate}`,
      `-b:a ${audioBitrate}`,
      `-vf scale=${resolution}`
    ])
    .on('start', (cmd) => console.log(`Запуск: ${cmd}`))
    .on('progress', (progress) => console.log(`Прогресс: ${progress.timemark}`))
    .on('end', () => console.log(`✅ Готово: ${path.basename(outputPath)}`))
    .on('error', (err) => console.error(`❌ Ошибка: ${err.message}`))
    .save(outputPath);
}

// Функция для рекурсивного чтения директории
function readDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readDirectory(filePath); // Рекурсия для дочерних папок
    } else if (path.extname(file) === '.mp4') {
      const compressedName = `${path.basename(file, '.mp4')}_compressed.mp4`;
      const outputPath = path.join(dir, compressedName);
      console.log(`🚀 Начало обработки: ${file}`);
      compressVideo(filePath, outputPath);
    }
  });
}

// Обработка файлов
readDirectory(inputDir);
