const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Укажите путь к FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Параметры сжатия
const inputDir = './input';
const outputDir = './output';
const fps = 30;
const videoBitrate = '5000k';
const audioBitrate = '128k';
const resolution = '1280x720';

// Создание папки для вывода
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

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

// Обработка файлов
fs.readdir(inputDir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    if (path.extname(file) === '.mp4') {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      console.log(`🚀 Начало обработки: ${file}`);
      compressVideo(inputPath, outputPath);
    }
  });
});
