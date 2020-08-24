import { Client, Provider, ProviderRegistry, Result } from '@blockstack/clarity';
import { assert, expect } from 'chai';
describe('ec contract test suite', () => {
  let ecClient: Client;
  let provider: Provider;

  const deployer = 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB';
  const addr1 = 'ST3XZWH9N9DJ8G3TBTKRRCCGDVMQE6A1BGGXGMQB2';
  const addr2 = 'ST3FKQA1K1NXJKCMT33042M7FRTK7NAE4JCFW8Z9F';
  const addr3 = 'ST1TKWM0WAXSX5P4FJPTHG06RP8DAYR1DN9K6ZQR6';
  const addr4 = 'ST1WJNB4E4EHK0HZ8S9A2TCE98NH8TZ3F2CKJRPRJ';
  const addr5 = 'ST100RH2Y0159NFBCXFNAZZHGXG4RBVPVBV83DBRE';
  const addr6 = 'STW4GZY5KDVTJDMVCG9J41YTKASKW8XRNBXMSMY8';
  const addr7 = 'ST2849SRP53ZGCJE5GF687WGXN3SEKYE53QE19ZYF';
  const addr8 = 'ST162E5VZ2E9Y42PA0ET3970RPS344KBTP95ECS1H';
  const addr9 = 'ST2HP1ADF45BNWSSGBHXKVAQ4SHDF1AG9RMYH0T0H';
  const addr10 = 'ST20JWQ8RG9AQ5ADZ9262FCEGE2XENX06F54D2CHE';
  const addr11 = 'ST1NRYC62CD5KEF7B59FV5PJ2D5AEYR7356EP34HS';
  const addr12 = 'ST3XNFDXS0YP05PETQJV88D9419QZRMGQTJ79PR09';

  const isMember = async (address: string) => {
    const query = ecClient.createQuery({
      method: { name: 'is-member', args: [`'${address}`] },
    });
    const receipt = await ecClient.submitQuery(query);
    return receipt.result === 'true';
  };

  const successInviteCountOf = async (member: string) => {
    const query = ecClient.createQuery({
      method: { name: 'success-invite-count-of', args: [`'${member}`] },
    });
    const receipt = await ecClient.submitQuery(query);
    return parseInt(receipt.result.slice(1));
  };

  const totalEarnOf = async (member: string) => {
    const query = ecClient.createQuery({
      method: { name: 'total-earn-of', args: [`'${member}`] },
    });
    const receipt = await ecClient.submitQuery(query);
    const result = Result.unwrapUInt(receipt);
    return result;
  };

  const getInvite = async (sender: string, recipient: string) => {
    const query = ecClient.createQuery({
      method: { name: 'get-invite', args: [`'${sender}`, `'${recipient}`] },
    });
    const receipt = await ecClient.submitQuery(query);
    return parseInt(receipt.result.slice(1));
  };

  const canInvite = async (sender: string, recipient: string) => {
    const query = ecClient.createQuery({
      method: { name: 'can-invite', args: [`'${sender}`, `'${recipient}`] },
    });
    const receipt = await ecClient.submitQuery(query);
    return receipt.result === 'true';
  };

  const register = async (params: { from: string }) => {
    const tx = ecClient.createTransaction({
      method: {
        name: 'register',
        args: [],
      },
    });
    await tx.sign(params.from);
    const receipt = await ecClient.submitTransaction(tx);
    return receipt;
  };

  const invite = async (newMember: string, params: { from: string }) => {
    const tx = ecClient.createTransaction({
      method: {
        name: 'invite-new-member',
        args: [`'${newMember}`],
      },
    });
    await tx.sign(params.from);
    const receipt = await ecClient.submitTransaction(tx);
    return receipt;
  };

  const acceptInviteFrom = async (sender: string, params: { from: string }) => {
    const tx = ecClient.createTransaction({
      method: {
        name: 'accept-invite-from',
        args: [`'${sender}`],
      },
    });
    await tx.sign(params.from);
    const receipt = await ecClient.submitTransaction(tx);
    return receipt;
  };

  const rejectInviteFrom = async (sender: string, params: { from: string }) => {
    const tx = ecClient.createTransaction({
      method: {
        name: 'reject-invite-from',
        args: [`'${sender}`],
      },
    });
    await tx.sign(params.from);
    const receipt = await ecClient.submitTransaction(tx);
    return receipt;
  };

  const withdraw = async (params: { from: string }) => {
    const tx = ecClient.createTransaction({
      method: {
        name: 'withdraw',
        args: [],
      },
    });
    await tx.sign(params.from);
    const receipt = await ecClient.submitTransaction(tx);
    return receipt;
  };

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    ecClient = new Client(
      'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.earn-chain',
      'earn-chain',
      provider
    );
  });

  it('should have a valid syntax', async () => {
    await ecClient.checkContract();
    await ecClient.deployContract();
  });

  describe('check before conditions', () => {
    it('addr1 is not a member', async () => {
      const isMem = await isMember(addr1);
      expect(isMem).false;
    });

    it('addr2 is not a member', async () => {
      const isMem = await isMember(addr2);
      expect(isMem).false;
    });

    it('addr3 is not a member', async () => {
      const isMem = await isMember(addr3);
      expect(isMem).false;
    });

    it('addr4 is not a member', async () => {
      const isMem = await isMember(addr4);
      expect(isMem).false;
    });

    it('total earn of addr1 is zero', async () => {
      const totalEarn = await totalEarnOf(addr1);
      expect(totalEarn).equal(0);
    });
  });

  describe('addr1 register member', () => {
    before(async () => {
      await register({ from: addr1 });
    });

    it('addr1 now is a member', async () => {
      const isMem = await isMember(addr1);
      expect(isMem).true;
    });

    it('total earn of addr1 is 1000', async () => {
      const totalEarn = await totalEarnOf(addr1);
      expect(totalEarn).equal(1000);
    });

    it('has no invite from addr1 to addr2', async () => {
      const invite = await getInvite(addr1, addr2);
      expect(invite).equal(999);
    });

    it('success invite count of add1 is zero', async () => {
      const successInviteCount = await successInviteCountOf(addr1);
      expect(successInviteCount).equal(0);
    });
  });

  describe('addr1 invite addr2', () => {
    before(async () => {
      await invite(addr2, { from: addr1 });
    });

    it('should create an invite from addr1 to addr2', async () => {
      const invite = await getInvite(addr1, addr2);
      expect(invite).equal(0);
    });
  });

  describe('addr2 accept invite', () => {
    before(async () => {
      await acceptInviteFrom(addr1, { from: addr2 });
    });

    it('invite from addr1 to addr2 will be success', async () => {
      const invite = await getInvite(addr1, addr2);
      expect(invite).equal(1);
    });

    it('success invite count of add1 is increased by 1', async () => {
      const successInviteCount = await successInviteCountOf(addr1);
      expect(successInviteCount).equal(1);
    });

    it('addr2 now is a member', async () => {
      const isMem = await isMember(addr2);
      expect(isMem).true;
    });

    it('total earn of addr1 is 1500', async () => {
      const totalEarn = await totalEarnOf(addr1);
      expect(totalEarn).equal(1500);
    });

    it('total earn of addr2 is 1000', async () => {
      const totalEarn = await totalEarnOf(addr2);
      expect(totalEarn).equal(1000);
    });
  });

  describe('addr1 invite addr3', () => {
    before(async () => {
      await invite(addr3, { from: addr1 });
    });

    it('should create an invite from addr1 to addr3', async () => {
      const invite = await getInvite(addr1, addr3);
      expect(invite).equal(0);
    });
  });

  describe('addr3 reject invite', () => {
    before(async () => {
      await rejectInviteFrom(addr1, { from: addr3 });
    });

    it('invite from addr1 to addr2 will be rejected', async () => {
      const invite = await getInvite(addr1, addr3);
      expect(invite).equal(2);
    });

    it('addr3 still not a member', async () => {
      const isMem = await isMember(addr3);
      expect(isMem).false;
    });

    it('total earn of addr3 is zero', async () => {
      const totalEarn = await totalEarnOf(addr3);
      expect(totalEarn).equal(0);
    });
  });

  describe('addr1 withdraw', () => {
    it('not success because success invite count less than 10', async () => {
      const receipt = await withdraw({ from: addr1 });
      expect(receipt.success).false;
    });
  });

  describe('addr1 invite more friend then withdraw', () => {
    before(async () => {
      await invite(addr4, { from: addr1 });
      await invite(addr5, { from: addr1 });
      await invite(addr6, { from: addr1 });
      await invite(addr7, { from: addr1 });
      await invite(addr8, { from: addr1 });
      await invite(addr9, { from: addr1 });
      await invite(addr10, { from: addr1 });
      await invite(addr11, { from: addr1 });
      await invite(addr12, { from: addr1 });

      await acceptInviteFrom(addr1, { from: addr4 });
      await acceptInviteFrom(addr1, { from: addr5 });
      await acceptInviteFrom(addr1, { from: addr6 });
      await acceptInviteFrom(addr1, { from: addr7 });
      await acceptInviteFrom(addr1, { from: addr8 });
      await acceptInviteFrom(addr1, { from: addr9 });
      await acceptInviteFrom(addr1, { from: addr10 });
      await acceptInviteFrom(addr1, { from: addr11 });
      await acceptInviteFrom(addr1, { from: addr12 });
    });

    it('success invite count of add1 is 10', async () => {
      const successInviteCount = await successInviteCountOf(addr1);
      expect(successInviteCount).equal(10);
    });

    it('total earn of addr1 is 6000', async () => {
      const totalEarn = await totalEarnOf(addr1);
      expect(totalEarn).equal(6000);
    });

    it('withdraw successfully', async () => {
      const receipt = await withdraw({ from: addr1 });
      expect(receipt.success).true;
    });
  });

  after(async () => {
    await provider.close();
  });
});
