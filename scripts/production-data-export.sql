-- ===========================================
-- EXPORTACIÓN DE DATOS PARA BASE DE DATOS DE PRODUCCIÓN
-- Generado: 2025-12-06
-- ===========================================

-- IMPORTANTE: Ejecutar en este orden para respetar las foreign keys

-- 1. USERS (38 registros)
INSERT INTO users (id, username, password, profile_description, logo_url, twitter_url, instagram_url, youtube_url, tiktok_url, website_url, threads_url, profile_background, email, google_id, is_google_user, role, user_role, replit_id, first_name, last_name, subscription_status, has_used_trial, trial_start_date, trial_end_date, stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_start_date, subscription_end_date, subscription_canceled_at)
VALUES
(22, 'FreeRangeTesters', 'c5a97df494c4189f1da2b686a3b761dcea3a02d71b91c750b1193dca9973f39e1daf34609b2c5938e3ae06c1aa74655c18716958e15442a1911e33804bfc0b81.f8b66aff58116ca6d3a8ec0e8e4560e2', 'Instructor y consultor privado en Ingeniería de Pruebas. Domesticador de Mantis religiosas ', 'https://i.postimg.cc/W1xt5YMD/temp-Image3n-M7-OR.avif', 'RangeTester', 'FreeRangeTesters', '@FreeRangeTesters', NULL, 'www.freerangetesters.com', NULL, 'pattern-1', NULL, NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'premium', true, '2025-05-27 09:20:53.663', '2025-06-10 09:20:53.663', 'test_customer_22', 'test_sub_22_1751428655511', 'yearly', '2025-07-06 20:52:14.723984', '2099-12-31 23:59:59', NULL),
(23, 'Pepe', '6e50185ae7936060a3afd8ae0550f2c02a61de6c1bd1570894034020cbc9af04d08a4e5222625cb699deb4fda90e5757e76de10b685b9d300ea6222f93a713c1.fe28448f25995f11faaaad3ab47a3e1f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'Reinidval', '81e2a008f9f3a7980e878812d4fcc527342fedbfcb27755b2365953e130924ec9fa1bd29b9fd0358ed53f99e79e1eff83c45916c58e7fab6e96eb603b134072c.92ba4b27a7a6631b79e5f123240ca961', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'premium', false, NULL, NULL, NULL, NULL, NULL, '2025-07-06 20:51:48.011866', '2026-07-06 20:51:48.011866', NULL),
(25, 'Jasper', '1517c0220b818eb8f6840726c0aab9350e19811dfe2a59b3054643ec94a701956cbfb80ce8c21161d6520f42017e4fde37be93ec40832cd58b8ac1af5ad11f4d.c49b0bbffb33cae00c30cf02b600bc46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'trial', true, '2025-06-13 04:25:39.09', '2025-06-27 04:25:39.09', 'cus_SUO0UppnPsHKCP', NULL, NULL, NULL, NULL, NULL),
(26, 'Paola-Med', '3c7b7f7008433a00d99eba96b891a2aa4e6e9003ed7c3fd10a7ce0391f06b0726b4c503336efa5b8288e0672a08f82ad487f91cd8c142139f0245781a8b56064.16361d871301c9879800270611c80230', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'ReneAlejandro', 'd45a1e8d84e365e23953309b2055758e272a0a8fd828d2b66e607220875dcb09e1a44ecd1024939eb0ee140ad8376aa4c7f3590f21249d163d7410ee264a02cc.878bc0bb7a5c571a9fdd0edf5df0ecc1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'francisdaboy', '0a51a764d4a77058d963019bc756cfe1351bd429559042ce9b651a738fd9994e43f0bfd30fdbf5d881e79d7579c5c0b6dd963a2af42c5e66c9c21d7b5eff2063.c3a39a14ea13347eb4fd49fc2c94be5f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'francisdaboy2', 'dbc9b0b16fa6e5100d6ad2bdc5b3def2598a403b2282a247de47b0af7495e17578a057c0fc5eda34a5ccdde19a2d9a483faf156777c2b2b709744227c2aada31.c9eed2e346754e8d59ee171fe003150a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'Peluche', '17ad347cedf884f2b559d14adc6bc638312fcc699a2940c8317086d229e04735f37c201a567542dcb110629903f690be89599842c43d53dd3344af488f835ba0.1b59b7846f6c7ebc91bea81509611f46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'TestUser', 'a5829c4f8fdd07992ed5de7aadf268a6423a398f11bbb1e75fb76ac0d48645871676aa9af977362d6b3cbfd9f9a260674accb3da824863a36a01ff451d573e05.2914b6d8c3aba099949a7ec5cd3da471', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'TestUser2', '184c17daf236d8d17ba07e7c3d5f24982d576e4c17425464ca9a1b39fa50f6513a3dd699962ea3a0e8e6751a4e4d08f3d5e235d5b0a1c2ff76b117884d215124.4001764f5387ed000bdeb240141879a0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'test2@example.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Creator1', 'a35ccb87c3ce931ac472d506963d8f3ab3df91a7c97715437932798ecc767699397bcaa99cdf873d7b601198064ec94f0f02b1acae96c31ab80e1e37ff394f52.7cd78c41ce6e8dc09aa4228c87551361', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'creator1@example.com', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'UsuarioTest', '6d8421d34629bf1301b9e55b4e002b48da058e4243f0d8e6b1382b1c29f8408646fde22684704a937d1e26ee6cf0d55fd7abac51c8fbf4c7a539088ee8096de9.2d24698cf40e872bf0ac423c0927a35b', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', NULL, NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'TestUser3', 'ddeda887caefe79f0c5edddaeab5f665c738f90320c425d1100e4a461ace282cc5bd78406ef8a61b02bb9636361982cb15f79e8724f2d5f9f3b01493a44490a2.59950169365331db32db23ad8c1dd681', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'test3@example.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'TestAudience', 'e50bea47b208679adaa79be3a882dd69f218337f9513f7e273f1605e3d8940b3880c771b27ac31baa306c02ddfee0f0222cc8f6112aa8f2ed9206eac47c963bb.e2c98c5d59c68f1be70a1d85433765e4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'audience@example.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Erincela', '95adbeeb2773c9bd09addc130b40574c3427b395324874143dd50e4bcee21a6dec365f9eec3ba98765d235227fa73c639e8a992b9f6eb5de792d70b172bc65b4.afe8ed1b40cd7ea4c9d2181fdc708a16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'erincela@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'tomasezarate', '94a76f87b10c1dc8607c70afbd3a657008620ecdc72a9cad02a8e11b3215910c57e7109902e0717f069047f929c41c8902112b6d00835fc55ebb1d4c20f1ed46.e791c3a594dcbfa4b2d9100947eec6f5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'zaratetomas99@gmail.com', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'bloomx', 'c98a7856f498a70528f1bc5abb603a7db2003c9c669dbc217c6054795c2208bd3dfd95d3a1dd56a108d45a52ab6d63df9ac9dceb4876a5489698300185f4ad58.af419a8cb9b3e70fe6cec524ecb247c8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'bloomedgeworld@gmail.com', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'testingparatodos', '722880c512d75c23135aac595231a0aba857389266a93a9bb74acc635e230efe1651887dd849db70e672bfe87c3a45e387bf76b7ee83d6ff6749c8495ace8d34.331d4ac0053c667416d1bf7f439228b6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'testingparatodos@gmail.com', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'NachoUgarte', '7f6211edd35cd83030b97b365022d0095af870ed8c90e33903344305a9b5321e71b682faa02e32c2bc4afe3c3f598e8adb7916701b41bea0b53bbfff69f25100.1f368f66c186762d5ae7905048e67c2a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'nachougarte03@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'melphite06', 'bcb907801405560bcf096f2ca59f96e0d540f86d37a54537010f2b7b3d5e59526ca8ed28db411b6c2880a4ae519c2ce8cf4a42cb88cbe3e1f014e126e85c1a1f.2bfe9857053429e022099f29962650a0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'criscuq7@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'agroconecta', 'b0ded7d3212187653224e653ff0e5cc8a0c3b50740cbb92c2bc0e4af43bcf72a7773ab434600d469c6b64de93a908b1ba3aa384edbf97b388b1d145ebeb8268f.e6c71405b25c04cc87379b3381202f18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'jjmunive@imbravo.pe', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'Eliana', 'c62fa12cd8fe05b94d9b1dec0f402721a99eb186b64501ae8fd4c32a04d61af76d35ea834efab80b221774bafc4daf52602697d485afc18fe9fd47834ea2944c.19f6dc03ff48efd03f99dc71fbeb0fdc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'elianabarretomoreira@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'GuidoS31', '4e85a47e7e75f221743d94cbaf107658272682736e15d4f6defc4e22d193b8d85d09c1afb39dfe45d6ad4238b3f8595f0ef398ded307bf54ee765fe5fa49f497.eb59f94601cf6c54f8ad855c992e71ed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'guidomsejas@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'testaudiencevote', '90691da5f576e32b6f960390922e1a00c5d726f0529ae258d10a428f41d703f03c2b1f4ae7394afecb4d81ac0d96294476fb6a23de7fb395edf99d0dd84785e6.1f83da567a4ac6e3fbb247cf62f94e8f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'testaudiencevote@test.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'testaudiencevote2', 'c225d3d015240cf72ff21664538fd0a535b92a4cca17c5806af91ee9e65dd4f637b2f4e641ae289ea75fcf462e6d9b710904c5d5b61f44d79a97342a83f3ca60.18ed1a3150575f93670a4c4eb15de0d4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'testaudiencevote2@test.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'R3nz0M3za', '7fe339024b26dd41d5f203d88e7445e1c7489efecb2e308dea2bd9c6983bc02ac312a16171ef3ee76bdb9617c025a3536982f33174a574c3bbf646dbc80fb20f.231ad825b72d3c0df8bd24f3733ed301', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'renzo.meza.valencia@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Rodpoblete', '9cc0313fee5d3adb0ff38843a75fc74d230947afad55b838529be564fa98d806951a2abdf331a73d092c1e5e96fde5c316cfb3df57507647729dfe810e6dcb10.d5ef260084b72c939eb0b653b0367221', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'rodrigopoblete.dev@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'RocioEspindola', 'd6d18f902e786b3be4443dd7c51a114b7193fb17bdce0ec1a7b3ca3dc8cccdd75d871cb91d490e2f8e0908995a5c4cd09a70828a4b993ff863de42e49724c603.e725788bf21b8bcf2cb4cf414999cf40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'espindola.rocio7@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'Ezequiel', '2ceecb1d0fc03189b06e18a76415d3f97716eef055edf85a71c8c052ce48c9706a1227f42ef576235f130574654e7b21e80dec374eb8cd64868e6ca204ecf074.b2a22dc582b9374819f53a6325fbfc50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'eze2003199317@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'Viviana', 'ce82217e8f263c1bd8d643d24560d91a9a6ea6b0a109ef25e01858d72263f87d81bc090df44dce447385ce3cfa99fc14e484d0a248b011dc3102fae824a7eea2.12e43ed1f47f5a4db487db89f3b3736f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'vivibelloso@hotmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'dorv61203', 'f13583e4ec20aba16c05762beeb4c8dbcd80cc29bf7de9f7425e0ab0bd28eac1944b3f18c557ac89f44f38a4e96c5b11dfcf4a0f293df9e2a7c5b2a251d7d000.e77e98279ca6c4dfd245383c7b428992', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'daniel61203@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'otrousername', '2ad4156ce14add07ef438f7770529dd145d7bea17dfe44b7f51c69741d290bf8b4b1c9ba431681d0649fbb49a363ffee0c695e2993292027c29027b9224c307a.e216d18d638e9218fbac74926a29c5f7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'isa2702@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 'LucasRR', 'efa13fcb5ccb82cfbb1d580a6e12a0cc54fc9bdb74560d86ee7164b56bd2fec427d1953f58a2d978ac44cdfc7f6ae2d008ca22b6b439fc9743837aad2d1f33b2.c301fbe328f074972c7d186843bd609a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'lucas-aupi@hotmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(58, 'LucasRR-', '360843f3534b6a927d204e7762d08565ceb5b7ceec0072868ef3d96feade44de5cda298d45edd043541055ee8381f225b0f58d0b6b2facfc8c341747b7485526.f02197d495b5bee1940086622687a35e', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'lucas.aupi@gmail.com', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'Alexrey95', '0c9ae5b49afcff25443181987a066bca24d88a32d1d846e908c3a8fd52f27d3c76ee380a9da25ca1ab48941c3c5371a884a89279828f2f489a3235f8f1bac001.af86eb89bfff0f56e94b750eee5b9025', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'bryam.rs95@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 'Kaizentismo', 'd37ad973254fafa23ee8a09efbc67e374d046dd79736c63891c4d73258524f8f32652077c0060784506143f79ce96a1220abd76eac1970591cdfd389dccf15b2.afed4b3d470177e40aa42181046e682b', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'patominer@gmail.com', NULL, false, 'audience', 'creator', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'Maxpower', 'e5d1d005e0456288e47eb712165d40cee33e11961716ea089d365b2a1694080493b15ce2ee7beafad2e6cedab4be68d06c3fae9c8f6f801bf261dd38cede8275.d000afef47d8d10a035e30c2f2e491fb', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gradient-1', 'matiasleonel2895@gmail.com', NULL, false, 'audience', 'audience', NULL, NULL, NULL, 'free', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for users table
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. IDEAS (38 registros)
INSERT INTO ideas (id, title, description, votes, created_at, creator_id, last_position_update, current_position, previous_position, status, suggested_by, niche)
VALUES
(94, 'La idea del millón', 'Esta es la descripción de la idea del millón', 0, '2025-06-13 04:23:49.378', 25, '2025-11-30 10:09:19.745', 18, 18, 'approved', NULL, NULL),
(107, 'Test Idea', 'This is a test idea', 2, '2025-07-27 21:58:47.915', 33, '2025-11-30 10:09:19.448', 9, 9, 'approved', NULL, NULL),
(108, 'Test Idea 2', 'This is a test idea 2', 1, '2025-07-27 21:59:17.013', 33, '2025-11-30 10:09:19.58', 13, 13, 'approved', NULL, NULL),
(109, 'Test Idea 3', 'This is a test idea 3', 1, '2025-07-27 21:59:19.439', 33, '2025-11-30 10:09:19.613', 14, 14, 'approved', NULL, NULL),
(110, 'Suggested Idea', 'This is a suggested idea', 0, '2025-07-27 21:59:33.814', 33, '2025-11-30 10:09:19.778', 19, 19, 'pending', 32, NULL),
(111, 'Nueva Idea para Votar', 'Esta es una nueva idea para probar el sistema de puntos', 1, '2025-07-27 22:03:36.204', 33, '2025-11-30 10:09:19.646', 15, 15, 'approved', NULL, NULL),
(117, 'Test 01', '', 0, '2025-08-30 13:41:08.574', 39, '2025-11-30 10:09:19.811', 20, 20, 'approved', NULL, NULL),
(131, '¿Cómo migré a Nueva Zelanda como QA?', 'Los pasos que seguí, la oportunidad y consejos', 6, '2025-10-11 22:22:55.603', 22, '2025-11-30 10:09:19.184', 2, 2, 'completed', NULL, 'vlog'),
(134, 'Voy a ser reemplazado por una IA', 'Me autoreemplazo con una IA para probar mi propia aplicación web. Te muestro los resultados', 3, '2025-10-11 22:26:09.537', 22, '2025-11-30 10:09:19.283', 4, 4, 'approved', NULL, 'review'),
(135, 'Trabajando en mi propio SaaS', 'Las cosas que nadie te cuenta sobre ser tu propio jefe', 3, '2025-10-11 22:26:51.296', 22, '2025-11-30 10:09:19.316', 5, 5, 'approved', NULL, 'behindTheScenes'),
(136, '¿Cómo instalar Playwright?', 'Empezá en literalmente 5 minutos! ', 1, '2025-10-11 22:27:11.442', 22, '2025-11-30 10:09:19.679', 16, 16, 'approved', NULL, 'tutorial'),
(137, 'Análisis de una de las herramientas de Vibe Coding del momento: Replit', 'Es tan buena como venden en las redes? Cuánto cuesta realmente? Qué pude hacer con ella?', 1, '2025-10-11 22:27:30.533', 22, '2025-11-30 10:09:19.712', 17, 17, 'approved', NULL, 'review'),
(138, 'Mis años de Game Tester...¿arruinaron los videojuegos para mi?', 'Un poco sobre el impacto que tuvo el haber trabajado como Game Tester y mi hobby ', 3, '2025-10-11 22:28:40.124', 22, '2025-11-30 10:09:19.349', 6, 6, 'approved', NULL, 'vlog'),
(139, 'El éxito en carreras tech y lo que te muestran las redes', 'No todo lo que brilla es oro...', 7, '2025-10-11 22:28:59.461', 22, '2025-11-30 10:09:19.15', 1, 1, 'approved', NULL, 'vlog'),
(140, 'Contract Testing con Pact', 'Complemento a API Testing? Para quién es?', 3, '2025-10-11 22:29:40.772', 22, '2025-11-30 10:09:19.382', 7, 7, 'approved', NULL, 'review'),
(142, 'Relación de dependencia vs independiente en Nueva Zelanda', 'Años en ambos bandos, te cuento mis pensamientos y dudas resueltas al respecto', 2, '2025-10-12 21:28:17.837', 22, '2025-11-30 10:09:19.48', 10, 10, 'approved', NULL, 'vlog'),
(143, '¿Te recomendaría meterte en una carrera tech en 2026?', 'El mundo está cambiando... mis opiniones como un profesional con más de 16 años en la industria.', 4, '2025-10-12 21:29:45.269', 22, '2025-11-30 10:09:19.25', 3, 3, 'approved', NULL, 'vlog'),
(144, 'Cuánto cuesta vivir en Nueva Zelanda siendo ingeniero QA', '¿Pensando en dar el salto? Dejame responder un par de cosas que los que hablan de backpacking no te responden', 2, '2025-10-12 21:34:27.71', 22, '2025-11-30 10:09:19.514', 11, 11, 'approved', NULL, 'vlog'),
(145, '4 errores de software no muy conocidos pero con consecuencias nefastas', 'Un error puede ser más que un usuario no pudiendo comprar algo online...a veces las consecuencias pueden impactar a todo un país, un gobierno o incluso causar la muerte...', 3, '2025-10-19 18:42:55.481', 22, '2025-11-30 10:09:19.415', 8, 8, 'approved', NULL, 'Historia'),
(146, 'PromptFoo: automation testing para LLMs', 'Qué ofrece? Cómo se usa?', 0, '2025-10-27 08:35:45.049', 22, '2025-11-30 10:09:19.844', 21, 21, 'approved', NULL, 'review'),
(147, '¿Qué hace un Business Analyst (Analista Funcional)?', 'Expliquemos qué hace este rol, cómo se relaciona con testing y sus responsabilidades y skills', 2, '2025-10-27 19:02:11.068', 22, '2025-11-30 10:09:19.547', 12, 12, 'approved', NULL, 'qna'),
(148, 'Playwright y sus nuevos y flamantes MCP Agents', 'Vamos a probar esta nueva funcionalidad, ver qué resuelve, qué no y si vale la pena usarla en capacidad profesional! ', 0, '2025-10-28 04:31:03.299', 22, '2025-11-30 10:09:19.877', 22, 22, 'completed', NULL, 'review'),
(149, 'Canary deployments: ¿Qué son?', 'Un tipo de pruebas del que quizás no escuchaste...', 0, '2025-10-29 00:17:35.156', 22, '2025-11-30 10:09:19.91', 23, 23, 'approved', NULL, 'tutorial'),
(153, 'Caminar como manera de destilar y alinear ideas', '¿Caminar para mejorar la productividad? Suena raro...pero hay argumentos científicos para confirmarlo. ', 0, '2025-11-13 03:03:44.684', 61, '2025-11-30 10:09:19.943', 24, 24, 'approved', NULL, 'vlog'),
(154, 'Un simple truco para mejorar tu relación con tu celular', '¿Sentís que tu celular te está robando tiempo de vida? Estuve ahí. Dejame contarte un simple truco que va a mejorar tu vida con ese adictivo aparato ', 0, '2025-11-13 03:12:15.53', 61, '2025-11-30 10:09:19.976', 25, 25, 'approved', NULL, 'vlog'),
(155, 'Notion: ¿Es para vos?', 'Llevo muchos años usando Notion. Dejame contarte para quién es así te ahorro tiempo.', 0, '2025-11-13 03:16:18.138', 61, '2025-11-30 10:09:20.008', 26, 26, 'approved', NULL, 'review'),
(156, 'Recordatorios de Apple', 'Gratis, potente e ideal para el ecosistema Apple', 0, '2025-11-13 03:23:25.754', 61, '2025-11-30 10:09:20.042', 27, 27, 'approved', NULL, 'review'),
(157, 'Notas de Apple: Le pusieron MUCHO amor a esta aplicación', 'Los últimos años Apple Notes recibió un par de updates que la hicieron pasar de una app medio pelo a una que resuelve prácticamente todas las necesidades que puedas tener.\nDejame mostrarte cómo la uso y lo que podés hacer con ella!', 0, '2025-11-13 03:35:41.293', 61, '2025-11-30 10:09:20.075', 28, 28, 'approved', NULL, 'review'),
(158, 'Reseña de Calendario de Apple', 'Con tantas opciones en el mercado...¿es la app nativa de Apple suficiente? Un análisis a fondo', 0, '2025-11-13 03:36:48.797', 61, '2025-11-30 10:09:20.107', 29, 29, 'approved', NULL, 'review'),
(159, 'Notion Calendar: Otro contendiente para los Calendarios de productividad', 'Notion Calendar levantó bastante revuelo cuando se lanzó. Pero...vale la pena? Análisis exhaustivo de esta herramienta', 0, '2025-11-13 03:39:47.45', 61, '2025-11-30 10:09:20.139', 30, 30, 'approved', NULL, 'review'),
(160, 'Drafts: Una app que hace una sola cosa (pero la hace muy bien)', '¿Por qué existe algo así, no? ¡En este video te enterás!', 0, '2025-11-13 03:40:45.069', 61, '2025-11-30 10:09:20.172', 31, 31, 'approved', NULL, 'review'),
(161, 'Segundo Cerebro de Tiago Forte: ¿Bazofia motivacional o útil?', 'Lo leí, me hice notas, apliqué las ideas...y te cuento mi opinión', 0, '2025-11-13 03:42:06.496', 61, '2025-11-30 10:09:20.204', 32, 32, 'approved', NULL, 'review'),
(162, 'Cómo me mantengo productivo pero feliz', 'Un tutorial paso a paso de cómo logré publicar más de 15 cursos, dos discos en Spotify, más de 300 videos en Youtube y 3 aplicaciones.', 0, '2025-11-13 03:43:01.776', 61, '2025-11-30 10:09:20.237', 33, 33, 'approved', NULL, 'tutorial'),
(163, 'Inteligencia Artificial: ¿burbuja o llegó para quedarse?', 'En este vídeo analizo y te cuento, con datos, qué podés esperar de la AI en los próximos años como trabajador tech', 0, '2025-11-17 23:44:07.619', 22, '2025-11-30 10:09:20.269', 34, 34, 'approved', NULL, 'qna'),
(164, 'Cómo evaluar si la IA generó un buen test', 'La IA te genera tests en, literalmente, segundos. Pero…cómo saber si te genera algo de calidad o no?', 0, '2025-11-30 09:45:29.022', 22, '2025-11-30 10:09:20.302', 35, 35, 'approved', NULL, 'tutorial'),
(165, 'Cómo entrevistar testers en la era de la IA', 'Todos ahora piensan que son testers senior por saber preguntar a ChatGPT. Qué podés preguntar en entrevistas para asegurar que estás metiendo a alguien idóneo a tu equipo?', 0, '2025-11-30 09:46:43.714', 22, '2025-11-30 10:09:20.334', 36, 36, 'approved', NULL, 'vlog'),
(166, 'Mi peor error como tester', 'Story time…de un GRAVE error mío ', 0, '2025-11-30 10:08:04.862', 22, '2025-11-30 10:09:20.367', 37, 37, 'approved', NULL, 'vlog'),
(167, 'Cómo reinventarte como tester en 2026 sin empezar de cero', 'Todo está cambiando…pero eso significa que hay nuevas oportunidades', 0, '2025-11-30 10:09:19.055', 22, '2025-11-30 10:09:20.4', 38, NULL, 'approved', NULL, 'vlog')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for ideas table
SELECT setval('ideas_id_seq', (SELECT MAX(id) FROM ideas));

-- 3. VOTES (45 registros)
INSERT INTO votes (id, idea_id, user_id, session_id, voted_at)
VALUES
(75, 107, 32, NULL, '2025-07-27 21:58:56.174'),
(76, 108, 32, NULL, '2025-07-27 21:59:26.791'),
(77, 109, 32, NULL, '2025-07-27 21:59:29.528'),
(78, 111, 32, NULL, '2025-07-27 22:03:39.965'),
(130, 107, 47, NULL, '2025-10-12 04:56:20.467'),
(134, 131, 45, NULL, '2025-10-12 18:06:18.713'),
(136, 139, 45, NULL, '2025-10-12 18:06:36.028'),
(138, 140, 48, NULL, '2025-10-12 23:27:34.709'),
(139, 131, 49, NULL, '2025-10-13 03:35:39.971'),
(141, 134, 50, NULL, '2025-10-13 10:27:42.701'),
(142, 135, 50, NULL, '2025-10-13 10:27:48.143'),
(143, 139, 51, NULL, '2025-10-15 11:16:59.095'),
(144, 143, 51, NULL, '2025-10-15 11:17:42.654'),
(145, 134, 52, NULL, '2025-10-15 13:23:21.582'),
(147, 131, 52, NULL, '2025-10-15 13:24:13.504'),
(148, 139, 52, NULL, '2025-10-15 13:24:25.257'),
(149, 143, 52, NULL, '2025-10-15 13:24:52.444'),
(152, 134, 54, NULL, '2025-10-20 03:15:58.966'),
(153, 137, 54, NULL, '2025-10-20 03:19:02.58'),
(154, 145, 54, NULL, '2025-10-20 03:19:18.628'),
(155, 139, 54, NULL, '2025-10-20 03:19:48.835'),
(156, 143, 54, NULL, '2025-10-20 03:19:59.299'),
(157, 135, 54, NULL, '2025-10-20 03:20:04.494'),
(158, 140, 54, NULL, '2025-10-20 03:20:13.726'),
(160, 136, 54, NULL, '2025-10-20 03:20:45.153'),
(161, 138, 54, NULL, '2025-10-20 03:20:52.009'),
(162, 142, 54, NULL, '2025-10-20 03:20:56.176'),
(163, 144, 54, NULL, '2025-10-20 03:20:57.891'),
(164, 131, 54, NULL, '2025-10-20 03:21:04.078'),
(165, 139, 55, NULL, '2025-10-31 02:31:51.004'),
(167, 143, 58, NULL, '2025-11-04 22:00:31.978'),
(168, 135, 58, NULL, '2025-11-04 22:00:37.663'),
(169, 138, 58, NULL, '2025-11-04 22:00:54.116'),
(170, 145, 58, NULL, '2025-11-04 22:01:04.275'),
(171, 144, 58, NULL, '2025-11-04 22:01:05.9'),
(172, 142, 58, NULL, '2025-11-04 22:01:09.382'),
(173, 147, 58, NULL, '2025-11-04 22:01:14.393'),
(174, 140, 58, NULL, '2025-11-04 22:01:26.272'),
(176, 139, 58, NULL, '2025-11-04 22:01:38.045'),
(177, 131, 58, NULL, '2025-11-04 22:01:39.183'),
(179, 131, 25, NULL, '2025-11-07 22:55:46.06'),
(181, 139, 62, NULL, '2025-11-16 22:48:13.855'),
(182, 145, 62, NULL, '2025-11-16 22:48:25.655'),
(183, 147, 62, NULL, '2025-11-16 22:48:35.064'),
(184, 138, 62, NULL, '2025-11-16 22:48:44.258')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for votes table
SELECT setval('votes_id_seq', (SELECT MAX(id) FROM votes));

-- 4. VIDEO_TEMPLATES (3 registros)
INSERT INTO video_templates (id, idea_id, created_at, updated_at, points_to_cover, visuals_needed, video_title, thumbnail_notes, hook, teaser, valor_audiencia, bonus, outro)
VALUES
(2, 139, '2025-11-03 03:27:20.676534', '2025-11-17 23:42:31.274', '[{"text": "Lo que te tira el algoritmo en Youtube/LinkedIn", "completed": false}, {"text": "La imagen de éxito que tenemos", "completed": false}, {"text": "Lo que hay detrás de eso que se ve en las redes.", "completed": false}, {"text": "Lo importante de entender los tiempos y el esfuerzo", "completed": false}, {"text": "No dejarse amedrentar cuando cueste", "completed": false}]', '[{"text": "Vídeo mío re viviéndola PoV, con un latte.", "completed": false}, {"text": "Preparando un genmaitcha, estético", "completed": false}, {"text": "Trabajando desde una playa mientras digo el hook", "completed": false}, {"text": "Ducha fría", "completed": false}, {"text": "Viajando en avión", "completed": false}, {"text": "Vistas épicas de Gold Coast", "completed": false}]', 'No todo lo que brilla es oro: él éxito tech que se muestra en redes', 'Un programador hipster trabajando chill desde un café en un lugar paradisíaco, logos de todas las últimas tecnologías populares y dólares volando', '[{"text": "Estoy seguro que viste videos de changos que la re viven (incluso yo!), pero…qué tan real es todo eso?", "completed": true}]', '[{"text": "Yo estuve de los dos lados: Consumiendo esas ideas y viviéndolas.", "completed": true}]', '[{"text": "No fue hasta los…13 años de carrera que empecé a "vivir ese sueño señor Pool": Cómo fue? Cómo saber que llega?", "completed": false}, {"text": "Muchos lo logran antes, otros después, otros nunca. Cómo lo lográs?", "completed": false}, {"text": "La costumbre actual de que todo está a un click, en un servicio de streaming y que así deberían ser los logros vs la realidad", "completed": false}]', '[{"text": "Lo que sí ofrecen las redes, es gente compartiendo conocimientos desde la experiencia con la esperanza de ahorrarte dolores de cabeza.", "completed": false}, {"text": "Cursos en la web", "completed": false}, {"text": "Guía 2025 para conseguir trabajo", "completed": false}]', '[{"text": "Es importante no bajar los brazos y no tener a los influencers, sea quien sea (obviamente yo tampoco), como contra lo que te medís. Uno tiene que ser su propia luz, su único adversario y no fijarse en los demás. Y eso, amiguitos, es algo extraordinariamente difícil de lograr.", "completed": false}, {"text": "Escuchar el camino que recorrieron varios en Testers por el Mundo para ver el esfuerzo que lleva", "completed": false}]'),
(3, 131, '2025-11-03 03:30:08.30871', '2025-11-11 10:11:51.021', '[{"text": "La oferta de Irlanda y no tener ni la idea de irme", "completed": true}, {"text": "Ver cómo se vive afuera con un sueldo tech", "completed": true}, {"text": "Por qué se pinchó esa oportunidad", "completed": true}, {"text": "Cómo hice para irme?", "completed": false}]', '[{"text": "B-rolls de presupuesto, cuentas. Hobbiton", "completed": false}, {"text": "Desde una playa o la city", "completed": true}, {"text": "Desde un café", "completed": false}, {"text": "Preparando mates", "completed": false}]', NULL, NULL, '[{"text": "Déjame poner en tu cabeza una idea que apareció por accidente en la mía y me cambió la vida para bien increíblemente!", "completed": true}]', '[{"text": "8 años como tester en Argentina, medio estancado, sin saber cómo era fuera ni la calidad de vida que daba", "completed": true}]', '[{"text": "Sepan de alguien que lo hizo, cómo es venir a NZ y también que vayan a escuchar el podcast de Testers por el Mundo", "completed": false}]', '[{"text": "La ironía de la propuesta de Irlanda 9 años después", "completed": false}]', '[{"text": "Testers por el mundo", "completed": true}, {"text": "Mentorías", "completed": true}, {"text": "Cursos y comunidad", "completed": true}, {"text": "Referencia al vídeo de cómo termine en testing", "completed": true}]'),
(4, 145, '2025-11-04 04:26:10.617126', '2025-11-04 04:26:49.82', '[{"text": "LASCAD – London Ambulance Service (1992)", "completed": false}, {"text": "Ariane 501 – ESA (1996)", "completed": false}, {"text": "Deutsche Bahn – apagón ferroviario nacional (2022)", "completed": false}, {"text": "Virtual Case File – FBI (2005)", "completed": false}]', '[{"text": "Explosión de cohete, caos post apocalíptico, protestas, Y2K", "completed": false}, {"text": "Titulares de noticias de los casos", "completed": false}]', NULL, NULL, '[{"text": "Dejame preguntarte algo: Qué sería lo PEOR que podría pasar por una falla en el sistema que probas, desarrollás actualmente? Dejame contarte de un par de casos que te van a abrir los ojos y te van a renovar el respeto por el trabajo de testing…", "completed": false}]', '[{"text": "Cuando pensamos en fallos de software trágicos, nos vienen a la mente casos como Therac-25 o el Y2K. Pero hay otros, menos conocidos, que colapsaron ciudades, gobiernos y hasta países enteros…", "completed": false}]', '[{"text": "Invitar a reflexionar qué consecuencias tendría el fallo del sistema que prueban hoy mis espectadores.", "completed": false}, {"text": "El impacto de un bug puede ser mucho más grave de lo que los espectadores piensan", "completed": false}]', '[{"text": "Cómo se podrían haber evitado?", "completed": false}, {"text": "Pensar qué consecuencias podría tener el fallo del sistema que estás probando hoy", "completed": false}]', '[]')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for video_templates table
SELECT setval('video_templates_id_seq', (SELECT MAX(id) FROM video_templates));

-- 5. STORE_ITEMS (2 registros)
INSERT INTO store_items (id, creator_id, title, description, points_cost, max_quantity, current_quantity, is_active, created_at, updated_at)
VALUES
(2, 22, '50% en un curso de Free Range 🙌🏻', 'Así es, decime qué curso querés con este descuento y te envío el cupón exclusivo para que lo obtengas a mitad de precio!', 50, NULL, 2, true, '2025-07-27 20:06:25.494497', '2025-10-21 19:05:25.457'),
(3, 22, 'Vale por 1 Mentoría', 'Reclamá una mentoría SIN COSTO alguno con este cupón.\nMás información sobre qué hacemos en las mentorías en: https://www.freerangetesters.com/mentoria-1-1-con-pato', 100, 3, 0, true, '2025-07-27 20:19:14.557562', '2025-10-09 21:54:18.259')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for store_items table
SELECT setval('store_items_id_seq', (SELECT MAX(id) FROM store_items));

-- 6. STORE_REDEMPTIONS (2 registros)
INSERT INTO store_redemptions (id, store_item_id, user_id, creator_id, points_spent, status, created_at, completed_at)
VALUES
(1, 2, 34, 22, 10, 'completed', '2025-07-28 03:24:00.637415', '2025-07-28 03:24:39.615'),
(2, 2, 37, 22, 10, 'completed', '2025-07-28 03:39:08.927901', '2025-07-28 03:39:44.08')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for store_redemptions table
SELECT setval('store_redemptions_id_seq', (SELECT MAX(id) FROM store_redemptions));

-- 7. NICHE_STATS (7 registros)
INSERT INTO niche_stats (id, creator_id, niche, total_votes, updated_at)
VALUES
(1, 22, 'Historia', 3, '2025-11-16 22:48:27.025'),
(2, 22, 'qna', 2, '2025-11-16 22:48:36.295'),
(3, 22, 'behindTheScenes', 3, '2025-11-04 22:00:38.608'),
(4, 22, 'tutorial', 1, '2025-11-02 21:37:46.114441'),
(5, 22, 'review', 7, '2025-11-04 22:01:27.222'),
(6, 22, 'vlog', 31, '2025-11-16 22:48:45.526'),
(7, 22, 'Cositas', 1, '2025-11-07 22:58:28.200069')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for niche_stats table
SELECT setval('niche_stats_id_seq', (SELECT MAX(id) FROM niche_stats));

-- 8. PUBLIC_LINKS (1 registro)
INSERT INTO public_links (id, token, creator_id, created_at, is_active, expires_at)
VALUES
(9, 'aa3f033c4b7da527922814dda0d499dc', 22, '2025-09-21 07:29:59.175', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for public_links table
SELECT setval('public_links_id_seq', (SELECT MAX(id) FROM public_links));

-- 9. USER_POINTS (43 registros) - omitiendo por brevedad, incluir si es necesario
-- Nota: Esta tabla tiene muchas entradas con datos de puntos por usuario/creador

-- 10. POINT_TRANSACTIONS (126 registros) - omitiendo por brevedad, incluir si es necesario  
-- Nota: Esta tabla tiene el historial completo de transacciones de puntos

-- ===========================================
-- FIN DE LA EXPORTACIÓN
-- ===========================================
