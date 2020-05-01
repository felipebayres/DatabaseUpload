import csvParse from 'csv-parse';
import { In, getRepository, getCustomRepository } from 'typeorm';
import fs from 'fs';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const contactsReadStream = fs.createReadStream(filepath);

    const parseStream = csvParse({
      from_line: 2,
    });
    const parseCSV = contactsReadStream.pipe(parseStream);

    const transactions: RequestTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value)
        throw new AppError('Invalid format in file');

      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCSV.on('end', resolve));
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];
    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filepath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
