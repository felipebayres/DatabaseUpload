import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import AppError from '../errors/AppError';

const csvFilePath = path.resolve(__dirname, 'import_template.csv');

const readCSVStream = fs.createReadStream(csvFilePath);

const parseStream = csvParse({
  from_line: 2,
});

const parseCSV = readCSVStream.pipe(parseStream);

const transactions = [];
const categories = [];
parseCSV.on('data', line => {
  const { title, type, value, category } = line.map((cell: string) =>
    cell.trim(),
  );

  if (!title || !type || !value) {
    throw new AppError('Invalid format in file');
  }
});

parseCSV.on('end', () => {
  console.log('Leitura do CSV finalizada');
});
