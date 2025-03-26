const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Bar } = require('cli-progress');

ffmpeg.setFfmpegPath(ffmpegPath);

// Параметры сжатия
const inputDir = 'C:/Users/Dmitriy/Videos/S.T.A.L.K.E.R.  Call of Pripyat';
const fps = 30;
const videoBitrate = '5000k';
const audioBitrate = '128k';
const resolution = '1280x720';
const supportedExtensions = ['.mp4', '.mov', '.avi']; // Поддерживаемые расширения

// Функция сжатия видео
async function compressVideo(inputPath, outputPath) {
  const bar = new Bar({
    format: `🚀 ${path.basename(inputPath)} | {bar} | {percentage}% | {duration}s`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        `-r ${fps}`,
        `-b:v ${videoBitrate}`,
        `-b:a ${audioBitrate}`,
        `-vf scale=${resolution}`
      ])
      .on('start', (cmd) => {
        console.log(`Запуск: ${cmd}`);
        bar.start(100); // Начать прогресс-бар
      })
      .on('progress', (progress) => {
        const percent = Math.floor((progress.currentFps / progress.currentKf) * 100);
        bar.update(percent); // Обновить прогресс-бар
      })
      .on('end', () => {
        bar.stop(); // Остановить прогресс-бар
        console.log(`✅ Готово: ${path.basename(outputPath)}`);
        resolve();
      })
      .on('error', (err) => {
        bar.stop(); // Остановить прогресс-бар
        console.error(`❌ Ошибка: ${err.message}`);
        reject(err);
      })
      .save(outputPath);
  });
}

// Функция для рекурсивного чтения директории
async function readDirectory(dir) {
  try {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await readDirectory(filePath);
      } else if (supportedExtensions.includes(path.extname(file).toLowerCase())) {
        const compressedName = `${path.basename(file, path.extname(file))}_compressed${path.extname(file)}`;
        const outputPath = path.join(dir, compressedName);
        console.log(`Начало обработки: ${file}`);
        await compressVideo(filePath, outputPath);
      }
    }
  } catch (err) {
    console.error(`❌ Ошибка чтения директории: ${err.message}`);
  }
}

// Обработка файлов
readDirectory(inputDir);
