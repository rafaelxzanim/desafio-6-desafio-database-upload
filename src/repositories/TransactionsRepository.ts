import {
  EntityRepository,
  Repository,
  getRepository,
  getCustomRepository,
} from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  // public async all(): Promise<Transaction[]> {
  //   const categoryRepository = getRepository(Category);
  //   const categories = await categoryRepository.find();

  //   const transactionRepository = getRepository(Transaction);
  //   const transactions = await transactionRepository.find();
  //   transactions.forEach(transaction => {
  //     let categoryOject = categories.find(
  //       category => category.id === transaction.category_id,
  //     );
  //     transaction.category = categoryOject;
  //     delete transaction.category_id;
  //   });
  //   return transactions;
  // }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(transaction.value);
            break;
          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;
          default:
            break;
        }

        accumulator.total = accumulator.income - accumulator.outcome;

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
