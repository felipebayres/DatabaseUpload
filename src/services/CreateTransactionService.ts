// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const invalidOutcome = await transactionsRepository.getBalance();
      if (invalidOutcome.total - value < 0) {
        throw new AppError('Not enough money in the account');
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
    });
    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (categoryExists) {
      transaction.category_id = categoryExists.id;
      transaction.category = categoryExists;
    } else {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      transaction.category_id = newCategory.id;
      transaction.category = newCategory;
    }

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
