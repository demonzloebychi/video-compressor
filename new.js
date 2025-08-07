const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Параметры сжатия и конвертации
const inputDir = 'C:/Users/adfla/Desktop/video/video2/';
const fps = 30;
const videoBitrate = '5000k';
const audioBitrate = '128k';
const resolution = '1280x720';
const supportedExtensions = ['.mp4', '.mov', '.avi'];
const outputExtension = '.mp4'; // желаемый формат после конвертации

// Функция удаления оригинала
async function deleteOriginal(inputPath) {
  try {
    await fs.unlink(inputPath);
    console.log(`🚮 Удален оригинал: ${path.basename(inputPath)}`);
  } catch (err) {
    console.error(`❌ Ошибка удаления: ${err.message}`);
  }
}

// Функция сжатия и конвертации видео
async function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath, [
      '-i', inputPath,
      '-y',                     // Перезаписать без подтверждения
      '-acodec', 'aac',         // Аудиокодек
      '-vcodec', 'libx264',     // Видео кодек
      '-r', fps.toString(),     // Кадры в секунду
      '-b:v', videoBitrate,     // Видео битрейт
      '-b:a', audioBitrate,     // Аудио битрейт
      '-vf', `scale=${resolution}`, // Масштабирование видео
      outputPath
    ]);

    ffmpegProcess.stdout.on('data', (data) => {
      // ffmpeg обычно выводит в stderr, stdout редко используется
      // console.log(`stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      // ffmpeg прогресс и ошибки идут сюда
      // Раскомментируйте, чтобы видеть прогресс:
      // console.error(`stderr: ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Готово: ${path.basename(outputPath)}`);
        // Можно раскомментировать удаление оригинала, когда проверите что работает хорошо:
        // deleteOriginal(inputPath);
        resolve();
      } else {
        console.error(`❌ Ошибка ffmpeg: код ${code}`);
        reject(new Error(`FFmpeg завершился с кодом ${code}`));
      }
    });
  });
}

// Рекурсивный обход директории и обработка файлов
async function readDirectory(dir) {
  try {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await readDirectory(filePath);
      } else if (supportedExtensions.includes(path.extname(file).toLowerCase())) {
        // Создаем имя выходного файла с новым расширением
        const outputFileName = `${path.basename(file, path.extname(file))}_compressed${outputExtension}`;
        const outputPath = path.join(dir, outputFileName);
        console.log(`Начало обработки: ${file}`);
        await compressVideo(filePath, outputPath);
      }
    }
  } catch (err) {
    console.error(`❌ Ошибка чтения директории: ${err.message}`);
  }
}

// Запуск
readDirectory(inputDir).then(() => {
  console.log('🔥 Все файлы обработаны!');
  process.exit(0);
});
