# Pourquoi ce repository ?
C'est une démonstration associée à la conférence *Passkeys pour une authentification fluide et sécurisée* présentée à [Symfony Live Paris 2025](https://live.symfony.com/2025-paris/schedule/passkeys-for-seamless-and-secure-authentication)

La présentation est disponible ici : https://github.com/rjanot/webauthn-sflive2025

# Installation
Executer la démonstration avec `symfony server:start`.
Vous devez lancer également la base de données Dockerisée (`docker compose up`) 

Le site fonctionne sur http://localhost:8000

Vous pouvez créer quelques user:
```
INSERT INTO public."user" (id, email, roles, password) VALUES (1, 'test@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (2, 'test2@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (3, 'test3@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (4, 'test4@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (5, 'test5@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (6, 'test6@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (7, 'test7@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (8, 'test8@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
INSERT INTO public."user" (id, email, roles, password) VALUES (9, 'test9@test.com', '[]', '$2y$13$og2KfSgYeEYZqAJyhRkIeeXcGvBaPbln4VM6bxx8byfMqNSxSQMzS');
```

Le mot de passe hashé est : `granted`

# Points clé

- config/packages/webauthn.yaml
  - repository : implémentent la couche entre notre application et la librairie WebAuthn. 2 repository à implémenter, et 1 entité.
  - creation_profiles : différents profils d'enregistrement, avec leurs parametrages respectifs, notamment le relying party
  - request_profiles : différents profils de connexion, avec leurs parametrages respectifs, notamment le relying party
  - controllers : le bundle fourni un controller, à appeler en Ajax, qui permet à l'utilisateur d'enroler lui-même son ordinateur pour le 2FA
  - secured_rp_ids : pour indiquer qu'on n'a pas besoin d'https sur ce Relying party

- config/packages/security.yaml
  - webauthn activé pour le firewall `main` : on spécifie la route qui fourni les informations pour l'authentificateur et la route qui vérifie que le challenge a bien été résolu

- public/client.js
  - découpe en plusieurs étape la récupération des options, l'envoi à l'authentificateur, et l'envoi au serveur de la réponse de l'authentificateur

# Flow
- Connexion > Profil > Enregistrement du device > Logout
- Connexion > Se connecter en tant que test@test.com > tadam 
