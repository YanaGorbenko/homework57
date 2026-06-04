import fs from 'node:fs/promises';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'node:path';

const DB_PATH = path.resolve('bd', 'tasks.json');

const readTasks = async () => {
  try {
    const tasks = await fs.readFile(DB_PATH, 'utf-8');
    const parsedTasks = JSON.parse(tasks);
    return parsedTasks;
  } catch (error) {
    console.error('Помилка читання файлу:', error.message);
    return [];
  }
};

yargs(hideBin(process.argv))
  .command(
    'list',
    'Отримати всі задачі',
    () => {},
    async argv => {
      if (argv.verbose) console.log('Викликано команду LIST');
      const tasks = await readTasks();
      if (tasks.length > 0) {
        console.log(tasks);
      } else {
        console.log('Ще не має жодної задачі у списку');
      }
    },
  )
  .command(
    'get',
    'Отримати задачу за id',
    () => {},
    async argv => {
      if (argv.id) {
        const tasks = await readTasks();
        const taskById = tasks.find(task => task.id === argv.id);
        if (taskById) {
          console.log(`Задача з id = ${argv.id}:`);
          console.log(taskById);
        } else {
          console.log(`Задача з id = ${argv.id} не знайдена`);
        }
      } else {
        console.log(`Для виконання команди get потрібно ввести id`);
      }
    },
  )
  .command(
    'add',
    'Створення нової задачі',
    () => {},
    async argv => {
      if (argv.title) {
        const tasks = await readTasks();
        const maxId = tasks.reduce((max, task) => {
          return task.id > max ? task.id : max;
        }, 0);
        const newId = maxId + 1;
        const newTask = { id: newId, title: argv.title, completed: false };
        tasks.push(newTask);
        await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2));
        console.log(`До списку додана нова задача:`);
        console.log(newTask);
      } else {
        console.log(`Для виконання команди add потрібно ввести title`);
      }
    },
  )
  .command(
    'update',
    'Оновлення існуючої задачі',
    () => {},
    async argv => {
      if (argv.id) {
        const tasks = await readTasks();
        const taskIndex = tasks.findIndex(task => task.id === Number(argv.id));
        if (taskIndex !== -1) {
          const taskByID = { ...tasks[taskIndex] };
          if (argv.title) {
            tasks[taskIndex].title = argv.title;
          }
          if (argv.completed) {
            tasks[taskIndex].completed =
              argv.completed === 'true' ? true : false;
          }
          await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2));
          console.log(`Початкова задача: `);
          console.log(taskByID);
          console.log(`Була змінена на `);
          console.log(tasks[taskIndex]);
        } else {
          console.log(`Задача з id = ${argv.id} не знайдена`);
        }
      } else {
        console.log(`Для виконання команди update потрібно ввести id`);
      }
    },
  )
  .command(
    'remove',
    'Видалення існуючої задачі',
    () => {},
    async argv => {
      if (argv.id) {
        const tasks = await readTasks();
        const taskIndex = tasks.findIndex(task => task.id === Number(argv.id));
        if (taskIndex !== -1) {
          const newTasks = tasks.filter(task => task.id !== Number(argv.id));
          await fs.writeFile(DB_PATH, JSON.stringify(newTasks, null, 2));
          console.log(`Задача з id = ${argv.id} була успішно видалена`);
        } else {
          console.log(`Задача з id = ${argv.id} не знайдена`);
        }
      } else {
        console.log(`Для виконання команди remove потрібно ввести id`);
      }
    },
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .parse();
