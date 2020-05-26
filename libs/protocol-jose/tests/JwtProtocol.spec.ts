import { JwtProtocol } from '../lib';
import { KeyStoreInMemory, ProtectionFormat } from 'verifiablecredentials-crypto-sdk-typescript-keystore';
import { CryptoFactory, SubtleCrypto } from 'verifiablecredentials-crypto-sdk-typescript-plugin';
import { IPayloadProtection, IPayloadProtectionOptions } from 'verifiablecredentials-crypto-sdk-typescript-protocols-common';
import { TSMap } from 'typescript-map';
import { JoseConstants } from 'verifiablecredentials-crypto-sdk-typescript-keys';

describe('JwtProtocol', () => {
    it('should create a JwtProtocol', async () => {
        const keyStore = new KeyStoreInMemory();
        const subtle = new SubtleCrypto();
        const cryptoFactory = new CryptoFactory(keyStore, subtle);

        const payload = {
            firstName: 'Jules',
            lastName: 'Winnfield',
            profession: 'hitman',
            email: 'jules@pulpfiction.com'
        };
        const payloadProtectionProtocol: IPayloadProtection = new JwtProtocol();
        const payloadProtectionOptions: IPayloadProtectionOptions  =  {
          cryptoFactory,
          options: new TSMap(),
          payloadProtection: payloadProtectionProtocol
        };

        
    // generate and save key
    const key = <CryptoKeyPair>await subtle.generateKey(
        <RsaHashedImportParams>{
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-256"}
        },
        true, 
        ["sign", "verify"]);
      const jwk: any = await subtle.exportKey('jwk', key.privateKey);
      await keyStore.save('key', jwk);
  
        
        const signature = await payloadProtectionProtocol.sign('key', payload, ProtectionFormat.JwsCompactJson, payloadProtectionOptions);
        expect(signature.get(JoseConstants.tokenProtected).get('typ')).toEqual('JWT');
    
        const serialized = signature.serialize();
        expect(serialized.split('.').length).toEqual(3);
          
    })
});