import { getCustomRepository } from 'typeorm';
import { isUuid } from 'uuidv4';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    if (!isUuid(id)) {
      throw new AppError('Id invalido!');
    }
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactionExist = await transactionsRepository.findOne({
      where: { id },
    });

    if (!transactionExist) {
      throw new AppError('Repositório não encontrado');
    }
    await transactionsRepository.remove(transactionExist);
  }
}

export default DeleteTransactionService;
