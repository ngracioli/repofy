# Testes de integração

Copie `.env.example` para `.env`, informe um token do GitHub somente de leitura em `GITHUB_TOKEN` e altere `RUN_GITHUB_INTEGRATION_TESTS` para `true`. Depois rode:

```sh
npm run test:integration
```

O teste usa `GET /user/repos` e só roda quando a flag e o token estão definidos. O arquivo `.env` é local e não deve ser commitado.
