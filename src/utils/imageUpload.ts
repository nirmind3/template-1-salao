/**
 * Utility to process, resize and compress images uploaded from the user's computer.
 * Converts uploaded files into optimized base64 Data URLs so they work everywhere
 * (local storage, Netlify, database, offline, standard <img> tags).
 */

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  sizeKb: number;
}

export async function processImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<ProcessedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem válida.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo selecionado.'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('Falha ao processar a imagem do arquivo.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Resize if exceeding maxDimension while preserving aspect ratio
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível inicializar o canvas de imagem.'));
            return;
          }

          // Use high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG data URL
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl,
            name: file.name,
            sizeKb,
          });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Erro ao processar imagem.'));
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
