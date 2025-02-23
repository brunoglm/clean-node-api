import { DbAddAccount } from './db-add-account';
import { AccountModel, AddAccount, AddAccountModel, AddAccountRepository, Encrypter } from './db-add-account-protocols';

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(value: string): Promise<string> {
      return 'hashed_password';
    }
  }
  return new EncrypterStub();
};

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(accountInput: AddAccountModel): Promise<AccountModel> {
      const account = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'hashed_password'
      };
      return account;
    }
  }
  return new AddAccountRepositoryStub();
};

interface SutTypes {
  sut: AddAccount;
  encrypterStub: Encrypter;
  addAccountRepositoryStub: AddAccountRepository;
};

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub
  };
};

describe('DbAddAccount Usecase', () => {
  test('Should call Hasher with correct plaintext', async () => {
    const { sut, encrypterStub } = makeSut();
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
    const addAccountParams = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    };
    await sut.add(addAccountParams);
    expect(encryptSpy).toHaveBeenCalledWith('valid_password');
  });

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();
    jest.spyOn(encrypterStub, 'encrypt').mockRejectedValueOnce(new Error('mocked_error'));
    const addAccountParams = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    };
    const account = sut.add(addAccountParams);
    await expect(account).rejects.toThrow('mocked_error');
  });

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addAccountRepositorySpy = jest.spyOn(addAccountRepositoryStub, 'add');
    const addAccountParams = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    };
    await sut.add(addAccountParams);
    expect(addAccountRepositorySpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    });
  });

  test('Should throw if AddAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    jest.spyOn(addAccountRepositoryStub, 'add').mockRejectedValueOnce(new Error('mocked_error'));
    const addAccountParams = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    };
    const account = sut.add(addAccountParams);
    await expect(account).rejects.toThrow('mocked_error');
  });

  test('Should return an account on sucess', async () => {
    const { sut } = makeSut();
    const addAccountParams = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    };
    const account = await sut.add(addAccountParams);
    expect(account).toStrictEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    });
  });
});
