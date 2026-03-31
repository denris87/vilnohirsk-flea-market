const express = require('express');
const cors = require('cors');
const papa = require('papaparse');

const app = express();
app.use(cors());

// ВСТАВ СЮДИ СВОЄ CSV-ПОСИЛАННЯ З GOOGLE ТАБЛИЦІ
const CSV_URL = 'https://docs.google.com/spreadsheets/d/10MgSaPFFh0mDE094UkrG1BQwHabmGvSg124F5B4T1lg/edit?usp=sharing';

app.get('/api/flea', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const approvedItems = results.data
          // Шукаємо колонку "Статус", де написано "Одобрено"
          .filter(row => row['Статус'] && row['Статус'].trim().toLowerCase() === 'одобрено')
          .map((row, index) => {
             
             // Обробка фото (якщо їх кілька, беремо перше)
             let rawPhoto = row['Фото (Тип запитання: Завантаження файлу)'] || '';
             let firstPhoto = rawPhoto.split(',')[0].trim();
             let photoUrl = firstPhoto;
             
             // Перетворюємо лінк Google Drive для відображення картинки
             if (photoUrl.includes('open?id=')) {
                 photoUrl = photoUrl.replace('open?id=', 'uc?export=view&id=');
             } else if (photoUrl.includes('file/d/')) {
                 const match = photoUrl.match(/\/d\/(.*?)\//);
                 if (match && match[1]) {
                     photoUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                 }
             }

             // Беремо дані з колонок (точні назви зі скріншоту)
             return {
               id: 'flea-' + index,
               title: row['Назва товару (Коротка відповідь)'] || 'Без назви',
               price: row['Ціна (Коротка відповідь)'] || 'Договірна',
               description: row['Опис (Абзац)'] || 'Без опису',
               phone: row['Телефон (Коротка відповідь)'] || '',
               photo: photoUrl,
               category: row['Категорія товару'] || 'Різне',
               condition: row['Стан товару'] || 'Не вказано',
               location: row['Місто/Область, де знаходиться товар'] || 'Не вказано'
             };
          });

        res.json({ items: approvedItems });
      }
    });
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flea Market API running on port ${PORT}`));
