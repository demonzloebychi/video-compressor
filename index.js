const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Параметры сжатия
const inputDir = 'C:/Users/Dmitriy/Videos/S.T.A.L.K.E.R.  Call of Pripyat';
const fps = 30;
const videoBitrate = '5000k';
const audioBitrate = '128k';
const resolution = '1280x720';
const supportedExtensions = ['.mp4', '.mov', '.avi'];

// Функция удаления оригинала
async function deleteOriginal(inputPath) {
  try {
    await fs.unlink(inputPath);
    console.log(`🚮 Удален оригинал: ${path.basename(inputPath)}`);
  } catch (err) {
    console.error(`❌ Ошибка удаления: ${err.message}`);
  }
}

// Функция сжатия видео
async function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath, [
      '-i', inputPath,
      '-y',
      '-acodec', 'aac',
      '-vcodec', 'libx264',
      '-r', fps.toString(),
      '-b:v', videoBitrate,
      '-b:a', audioBitrate,
      '-vf', `scale=${resolution}`,
      outputPath
    ]);

    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Готово: ${path.basename(outputPath)}`);
        
        // Удаление оригинала
        deleteOriginal(inputPath);
        
        resolve();
      } else {
        console.error(`❌ Ошибка: ${code}`);
        reject(code);
      }
    });
  });
}

// Рекурсивный обход директории
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

// Запуск
readDirectory(inputDir).then(() => {
  console.log('🔥 Все файлы обработаны!');
  process.exit(0); // Принудительное завершение процесса
});
