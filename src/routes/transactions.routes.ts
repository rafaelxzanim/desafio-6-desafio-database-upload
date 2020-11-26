import { Router } from 'express';
import { resolveConfig } from 'prettier';
import { getCustomRepository, TransactionRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import fs from 'fs';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  //eu const transactionsRepository = new TransactionsRepository();
  //eu const transactions = await transactionsRepository.all();
  //eu const balance = await transactionsRepository.getBalance();
  //eu return response.json({ transactions, balance });
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  //Se tiver regra de negócio na rota tem que ser criado um service

  //TODO MESMO

  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();
    const transactions = await importTransactionService.execute(
      request.file.path,
    );
    return response.json(transactions);
  },
);

// transactionsRouter.post(
//   '/import',
//   upload.single('import'),
//   async (request, response) => {
//     let fileInfo = fs.readFileSync(
//       uploadConfig.directory + '\\' + request.file.filename,
//       'utf8',
//     );

//     // fs.readFile(
//     //   uploadConfig.directory + '\\' + request.file.filename,
//     //   'utf8',
//     //   (err, data) => {
//     //     if (err) {
//     //       fileInfo = err;
//     //     }
//     //     //console.log(data);
//     //     fileInfo = data;
//     //   },
//     // );

//     // let fileInfo = await fs.promises.stat(
//     //   uploadConfig.directory + '\\' + request.file.filename,
//     // );

//     // let fileInfo = fs.createReadStream(
//     //   uploadConfig.directory + '\\' + request.file.filename,
//     //   'utf8',
//     // );

//     //console.log(data);
//     return response.json({
//       message: fileInfo,
//     });
//   },
// );

export default transactionsRouter;
