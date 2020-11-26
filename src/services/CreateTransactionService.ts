import AppError from '../errors/AppError';
import {
  getCustomRepository,
  getRepository,
  TransactionRepository,
} from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    //Se não tiver balance nem adiantar dar outcome
    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    //Regra de negócio 1 - Analisar se o tipo da category é income ou outcome, caso contrário gera um erro
    //Se o type de transaction for invalido dar uma zica

    if (!['outcome', 'income'].includes(type)) {
      throw new Error('Transaction type is invalid');
    }

    //Regra de negócio 2 - Analisar se já existe uma categoria com o mesmo titulo na tabela de categories, caso contrario adicionar

    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
