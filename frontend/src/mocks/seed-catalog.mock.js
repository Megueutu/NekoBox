const MISSING_MEDIA_URL =
  "https://picsum.photos/seed/nekobox-missing-media/1200/675";

const media = ({ cover, banner, poster, screenshots = [] }) => [
  {
    type: "cover",
    url: cover || MISSING_MEDIA_URL,
    position: 1,
    is_placeholder: !cover,
  },
  ...(banner ? [{ type: "banner", url: banner, position: 1 }] : []),
  ...(poster ? [{ type: "poster", url: poster, position: 1 }] : []),
  ...screenshots.map((url, index) => ({
    type: "screenshot",
    url,
    position: index + 1,
  })),
];

const catalogGame = ({
  id,
  title,
  slug,
  description,
  price,
  releaseDate,
  categories,
  tags,
  publisher,
}) => ({
  id,
  owner_id: "usr_catalog_seed",
  title,
  slug,
  long_description: description,
  price,
  release_date: releaseDate,
  status: "published",
  media: [
    ...(seedMediaBySlug[slug] || []),
    ...(seedPosterBySlug[slug]
      ? [{ type: "poster", url: seedPosterBySlug[slug], position: 1 }]
      : []),
  ],
  categories,
  tags,
  publisher: {
    id: publisher.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: publisher,
    logo_url: "",
  },
  updates: [],
});

export const seedMediaBySlug = {
  "hollow-knight": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307583/1-tgg1vtswva_vdhblc.png",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/91d47e238a9e2cb5f33e10e4b54c911b4beaafcad3e14a9e_kzsgie.avif",
    screenshots: [
      "4ea721a23a20b67707fbf5d69b39a305c4e1d6d320800576_oavrkh",
      "14c9dd1071f9c112cd2463c0b097ffdf2c59f21c655459e6_mbggf1",
      "9937901dc35fe88cc2c947b1eecdb3f9f186ca64269273d8_nfqhlc",
      "a9dbdffcbcd942f97bd1e4418ed250d49f556bc514c80cb2_ddfwod",
      "e4e40255c4cef4f9d83e220441cc794bbc49bd9029e3deae_h4skxd",
      "f68bed187022f0acb95a1945199f1370a3f332bbe78b1ea0_zcqivj",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805989, 1785805993, 1785805993, 1785805996, 1785805996][index]}/${id}.avif`,
    ),
  }),
  "hollow-knight-silksong": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/9396dc04cc0161e5a17f8775402f2c3afdcb5d8043a7ebf8_ielpmn.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/9396dc04cc0161e5a17f8775402f2c3afdcb5d8043a7ebf8_ielpmn.avif",
    screenshots: [
      "4c666cab506dfdf3e9469c4835f51ee3e472ab350b03b4a3_ypwsf2",
      "08b19c7ef4fcc3a6ca370ce65c6ea3bb855e36b584e4044a_uhf4ng",
      "52f93db9eed66234db64703fc279d673cbc83dec97eb6bb2_lr0kew",
      "155e14df406bbfea7ea5ffea758936061396bf91803da6a2_gf28gw",
      "3980a8757252ca77f4627bd0e0e505348da978f6c2b3a453_sskxvh",
      "6145661f43db3aa357cfcf1406e2b9ef5604adac91af04cf_wwxz6v",
      "df324b3ee1c4f136f5749164e21ba6656c18d5a6e1790e75_nzoxki",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805988, 1785805989, 1785805990, 1785805992, 1785805992, 1785805996][index]}/${id}.avif`,
    ),
  }),
  "assassins-creed-black-flag-remake": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/30972495c4d1b567dcd015b80c0d3af9c946efc8822944d7_qwsind.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/f1fe921628640e04e0019a7c874a0215dbe26bec1f4b6df2_t8iedq.avif",
    screenshots: [
      "0d9e9f056f2d03bbf86ee2dcb1815bc071504109baa86b88_xkuict",
      "8063607e29c74f35e590945fa66ac18de08ef03c6cc09f85_pdvohz",
      "b4e22cd44ad3f5fb7a9dc551401c1a9991a58bb6df3cd8df_n294ij",
      "d478cb56002fd2cb2e04d8cfd8490942fced08e62db2933e_gf0lgt",
      "dd35830fb3d2c5e8bc08b5ed6be69fd1904b9a1a7d354855_gw0rlt",
      "e8b9a90a1b989b14aec6fca118bccdfced151d199994ab52_mmjie4",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805992, 1785805994, 1785805995, 1785805995, 1785805996][index]}/${id}.avif`,
    ),
  }),
  "grand-theft-auto-vi": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307693/GTA-VI-article-image-illustration-2_mfoij4.webp",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/1c8e3e304f0bad2d99ffed828ad460ebe5949608cb82a5dd_veylsj.avif",
    screenshots: [
      "1b1bb3a94bbd1a8a4e7514763d016f510e24247b4d864ff6_iwulpc",
      "5d18cf5f59260666abe5029f450ba2b5a61d996b0503e1fc_xz5tmd",
      "6e2a7c7eb29de1f04c32820823f66858fbc3d9ab9adf88a9_pojfdm",
      "3139bd312f0bfb208738dc2b752d17c3fb9d4ad50c2c25aa_bfz13y",
      "9106bb2a9b8835b8f617c892edbbe46312cb2e0e3d16b480_wdaqos",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805986, 1785805987, 1785805991, 1785805992][index]}/${id}.avif`,
    ),
  }),
  "elden-ring-nightreign": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307466/Elden-Ring-Nightreign-290525_l46qa4.png",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/b21fc6bafea0353ad8578dec61cd2690020b615f161c416e_mbr7zx.avif",
    screenshots: [
      "1d7f60c58f6efbe48079d1ff8773c49c32c341c9ae992e0f_iqljbz",
      "7a8b663566237f74b48758e7faba85ff9e3f565178e82253_liyraa",
      "45e68fda0fcfe7fe3523b5012ab9af14e88db2a1387388af_lhnoth",
      "75caece2da1c88c118907670406d83b6d29a73869f9426fe_grre7z",
      "109df616efc3f73a6de74967928346e6b891ec31c3952c5c_adb82h",
      "fe69b66a0f2e238fa1b2577fac5681733bc69fc2849ceac3_u1nplv",
      "PREVIEW_SCREENSHOT7_109885_ywf51r",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805988, 1785805989, 1785805989, 1785805990, 1785805997, 1785806001][index]}/${id}.avif`,
    ),
  }),
  "elden-ring": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307550/ER-collection-2000x1125-780428_igoswx.png",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/M2IBVSWR2ao2oHizClzsUaYL_ksajdf.webp",
    screenshots: [
      "1fdf69c57c1ef3af7e137bf260510354b59870e71f7a6e8b_wwdkvv",
      "5c4a4ddd38c9db0fb0a0cf7c3cddee592c83bc7b180f9267_u20rae",
      "8dcbe67db4fe71d7cb71d0855ec2e5864fdeae7f177b884c_mzlryu",
      "335fda4e507ce5de650984ddd1638c45dc87c74c24ec8c24_rrfqqv",
      "621d598da03399e9788e3028aed34b9df33115e2156102fe_sitfsr",
      "a7a3c819e53f1427fa90f3062217bb6268696a0ebde47539_m3uosh",
      "fe7053cb00f45f480737a5cc170fc3f1e9ec47aca48c2475_d9llbk",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805987, 1785805989, 1785805991, 1785805991, 1785805993, 1785805997][index]}/${id}.avif`,
    ),
  }),
  "eldest-souls": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308050/apps.29240.14189158524560144.27914bed-e8a1-42b9-ae1b-8794ad1be952_mkzgps.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/bOtJXHmvkx4iJCU21kFH1APZ_fdg4da.avif",
    screenshots: [
      ...[
        "1sUjGLkgvlBbb6EU1egjgoYS_w1tnog",
        "7nyQkp1Pe6bHcri1T3LI0OYy_myivul",
        "R5uwFp2MAdNDWGRCxUlZWDNy_zg8xex",
      ].map(
        (id, index) =>
          `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805988, 1785806002][index]}/${id}.avif`,
      ),
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307121/u9BXvSZftbLJ1w8ZaESMS4lc_lertnd.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307121/n1xiZhfikaSgmMqpcqlwKRdu_j0489t.avif",
    ],
  }),
  "hades-2": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308084/MV5BYmU1MzVkYjMtNmI2Ny00NWQzLWE5MjQtZTIzNzgzMGY3ODEyXkEyXkFqcGc._V1_FMjpg_UX1000__qqr7sl.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/93f66b17d66159f2a06f2f001b0e28cb485b524c9204797b_pqwyv8.avif",
    screenshots: [
      ...[
        "1ddcec87d4be70acd848473572c14128024db5786ec46ee7_l3yyss",
        "2dff06b0be12903fbddbc2bd578bcdbe6136730ec2e18bac_ahtvuf",
        "08c5b674ef49cc0139791254f2ca1528a8239c3922842621_qp0qwg",
        "raGBM82s7S5GfCR1Kjh9eSop_vyeay0",
      ].map(
        (id, index) =>
          `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805986, 1785805987, 1785805989, 1785806002][index]}/${id}.avif`,
      ),
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307120/05f26dcb60585da07389c6f27345e665646a226a84ec5ded_knlk50.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307119/fd064d78bf3f585e10e51be3d652c7a5f83cf9763e22b24a_wkos5n.avif",
    ],
  }),
  "call-of-duty-modern-warfare-4": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786311695/16x9_CallOfDutyModernWarfare4_image1600w_ky8hid.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/972f277c6ca05ffd7b4f290ba34ebc0131bffc73e2a7548d_fpyvv4.avif",
    screenshots: [
      "6d9d0cb6602f3eb2b655e202e9b7b68114ff74505a20575e_vvrkfq",
      "6efef757dc2f5c06c3ffa95871cc5fc94523ee2739043c83_cbgblf",
      "ade65b9e9216d88cb89f864f445e52b5f3d7a6b6ae57b0ff_tfo9yq",
      "d21a425ed8dfc7ca0731b593de37ea8de40ee6c4b4d93891_rie37m",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805987, 1785805988, 1785805994, 1785805995][index]}/${id}.avif`,
    ),
  }),
  "dragon-ball-sparking-zero": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/881aeea06b117a39f1724a4d7ebf66b152a088475e4467e4_nfucut.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/70bf2b0857ebc50a44d0e281d711cede69f592785da33d97_k5nozh.avif",
    screenshots: [
      "3b49de028249b81b51a531debf39f65aa6fc08c65f865101_rmk7re",
      "7de725f13584a8b7b4426cecefb30714801740b6365798ce_zhnrf2",
      "905d6d57a028928cc8f7f623643c339ab2bd2a2fc1183370_zjb4os",
      "bba7d02ae9cae5f4b87c87bc4e86a215eb28ae70a2908e14_i8x5ac",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805987, 1785805988, 1785805991, 1785805994][index]}/${id}.avif`,
    ),
  }),
  "the-witcher-3": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307423/3f7ee6aa3482b514bd443e116022b038a9728f017916ed37da3f09f731a7d5f2_oql09m.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/IW5r8hLVZzf0ApOyiOuRnKUe_cvfqcd.jpg",
    screenshots: [
      "5DSZkROrbrlYN2PXGfDGedeM_wbjrnr",
      "iFujqkGQJZKBGjpw1kgAkjWe_flr6bl",
      "mfy0530smBKbptFC5oEIaEyi_lwpbw9",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805987, 1785805997, 1785805998][index]}/${id}.avif`,
    ),
  }),
  "cyberpunk-2077": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/bxSj4jO0KBqUgAbH3zuNjCje_hnuhwb.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/UjQ1pWQiHwymgQQ6q4pWQkMC_nlek1l.avif",
    screenshots: [
      "4afa4359de58e6c1fe2509b0bf19c3dded734f5d9f7be0ed_t4fubo",
      "PT2qWfNzcGncIlTB0SlzFYY9_loktv2",
      "To8WFTjfrMQtrX63D0GoCNRj_x4ujy6",
      "SWnz126faKV0CbPOVzCk2R3M_bsyghl",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805988, 1785806001, 1785806002, 1785806002][index]}/${id}.avif`,
    ),
  }),
  minecraft: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/670c294ded3baf4fa11068db2ec6758c63f7daeb266a35a1_sjezdo.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/91fe046f742042e3b31e57f7731dbe2226e1fd1e02a36223_issij9.avif",
    screenshots: [
      "6fe83bf38f93a06816c21b46ce73945f157260319c4a77d2_prt4b6",
      "94dd1a47ceec2cd4fbd4839938ddfcc51d8cad604b57c595_p6ksxx",
      "0193d3b773501fffe0609513ab4e134ff14759ede12d4423_r2mwbm",
      "51311490f915043da2f955969ac22133541f122c78c168f5_kum8cu",
      "fc3e64baae92f6976c2ec81e4020e7862c9afaaf103c1317_p0fwmg",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805988, 1785805990, 1785805990, 1785805993, 1785805996][index]}/${id}.avif`,
    ),
  }),
  "marvel-rivals": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/aeb816655b966f6e96a0fc4929afba02da754badf872f10f_zzjj6k.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/907bba0da07662df166e58a65ef6fff1c23439ae11c31db7_vecwuu.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7ca0dd31fecc5a0263171dc1ac1ea6befc8c68a65cbf6ed1_xzjqag.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/034f754b52a25a00736af4b882a9c6d26246dc634b36c62d_n6njhn.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/1497203e1cb92ca05a9aba5f9f945123509dbe98bbc319b3_vtgs7z.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/beca58d8d8c64b5f874bf722b0852eb91844fc165a740402_h8rufp.avif",
    ],
  }),
  "halo-campaign-evolved": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/a0d52445fcb5d96d66a361b6759d1b8b959c4644cea70714_zvkgj3.avif",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/5102f2929b3357cb4af79022f4fc2234fc5756710947e91a_edmtif.avif",
    screenshots: [
      "7f525c8831b83edd4443bab95a5daae307ef2da814d7b398_ainlx7",
      "7808104862aafa9eede3c8eaacc204b5ac8245d97cf90668_mgdr2d",
      "afba6274e85aa8de25cbb7f07409bab9f87e37d61ffc08c0_cpvtdj",
      "e3cf56087f2010c33bde8a30b68f57948f2bc8e1dc819980_z6svhv",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805988, 1785805993, 1785805995, 1785805996][index]}/${id}.avif`,
    ),
  }),
  hades: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307889/hades_bw1hy6.webp",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/pYyqTYA34U1a7hv6BCrqgc24_zypcq1.webp",
    screenshots: [
      "327fb169e7af8eb759a72c0aba917194451047e1b3776758_z1lsp5",
      "CWACHJZ2R8OoZp52SH1UqlXl_qh0pwd",
      "h1Tmq8oRqHn1Hiyh8OozLpTi_omuiu9",
      "htIpeQrsndcAUvsQFcUnwlxQ_gzvngm",
      "nFLj8gGhCcJnSnUeK06Ns8qe_ae7hal",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805990, 1785805995, 1785805997, 1785805997, 1785805999][index]}/${id}.avif`,
    ),
  }),
  "demons-souls": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308164/mixcollage-21-dec-2024-12-41-pm-2315_aggsbe.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/brIXKBE5BqYgBSrsDn6Wo18O_gv8k0f.avif",
    screenshots: [
      "lK4tpxDNLfOxHly1yE5ceKNt_aule4d",
      "NE92EYZjGR8hU8ZcNDgEYEX1_dfe44s",
      "p3BNVCDOeLpb3bWAptk2Hi2t_xzqj7q",
      "OtTU8V9BfVqiy4jp0QhHp8ad_m7hywr",
      "s1gIFpXqw8t18gzshEHkv8r2_x4msa4",
      "sYFQ266gczqGyso9d8PjJ1Al_xxozqy",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805998, 1785805998, 1785805998, 1785805999, 1785806002, 1785806002][index]}/${id}.avif`,
    ),
  }),
  celeste: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308111/apps.21257.71633162879241707.7cf18b3b-9fa5-486f-9a68-067f06d50bf1_iovi27.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/hgqlI1LTcsd6zuL7YWVLQ8d00jkBmtCg_pdm532.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT2_161659_izqbbu.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT3_161659_nuwcy3.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307117/PREVIEW_SCREENSHOT4_161659_lb0f3q.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307117/PREVIEW_SCREENSHOT5_161659_brobqd.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307116/PREVIEW_SCREENSHOT6_161659_nt0hog.avif",
    ],
  }),
  "dark-souls-3": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308192/images_wcxjkm.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/zA0pyOR4JXOtGGIY7Jp2FJZP_p8ismg.avif",
    screenshots: [
      "PREVIEW_SCREENSHOT1_77921_ayuygk",
      "PREVIEW_SCREENSHOT2_77921_cmp1ja",
      "PREVIEW_SCREENSHOT1_109885_q6jtln",
      "PREVIEW_SCREENSHOT2_109885_jrb8ao",
      "PREVIEW_SCREENSHOT3_77921_naxrf1",
      "PREVIEW_SCREENSHOT3_109885_fhkz2m",
      "PREVIEW_SCREENSHOT4_77921_kmqse4",
      "PREVIEW_SCREENSHOT5_77921_twukh5",
      "PREVIEW_SCREENSHOT4_109885_h1vtbg",
      "PREVIEW_SCREENSHOT6_77921_oxg56e",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805999, 1785805999, 1785805999, 1785805999, 1785806000, 1785806000, 1785806001, 1785806001, 1785806000, 1785806001][index]}/${id}.avif`,
    ),
  }),
  "red-dead-redemption-2": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/Hpl5MtwQgOVF9vJqlfui6SDB5Jl4oBSq_uweazv.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806004/WyHa1BM3ISDVqYSEUMB9VZJs_bfe8u8.avif",
    screenshots: [
      "PREVIEW_SCREENSHOT1_166081_kvyqms",
      "PREVIEW_SCREENSHOT4_166081_c0bi3q",
      "PREVIEW_SCREENSHOT5_166081_lravql",
      "PREVIEW_SCREENSHOT7_166081_rq0mxs",
      "PREVIEW_SCREENSHOT10_166081_djlfoi",
      "PREVIEW_SCREENSHOT8_166081_f45khu",
      "PREVIEW_SCREENSHOT9_166081_kounmg",
    ].map(
      (id, index) =>
        `https://res.cloudinary.com/meguitooooooo/image/upload/v${[1785805999, 1785806000, 1785806001, 1785806001, 1785806001, 1785806001, 1785806001][index]}/${id}.avif`,
    ),
  }),
  "stardew-valley": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307843/tile_wayfij.webp",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/yPmlPNe9extT2AVsv90hOKmn_np3zpb.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT2_130501_jjz4a1.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307126/PREVIEW_SCREENSHOT1_130501_oyorel.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307124/PREVIEW_SCREENSHOT3_130501_etm5sw.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307124/PREVIEW_SCREENSHOT4_130501_nmxigj.avif",
    ],
  }),
  "gta-5": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305802/bZ1JTRXzoyl3hkcsloKcCgdBGTAV_banner_vthhn4.webp",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305802/gtavcover_ymqnr8.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/8kNkdvIIbW8YCoFQkv5tdVU5_lhfnid.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/4aX03Zu8ocLyP0bQui1AiKcotpPFgPeAv6YWMBUg51YyZcdv_yncrrm.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/tpPFgPeAv6YWMBUg51YyZcdv_s158c2.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/DogIYjDGyXPn1vI4a62P5XN3_c32dge.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/WGP58ZYx9ZjS816Ksjm3fgNR_tk41cy.avif",
    ],
  }),
  "baldurs-gate-3": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786311758/apps.11593.13550459053619040.9c555c73-a698-4992-b0f3-c5084cf18b5e_dkikhk.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/95cce955dc59d04e2ea5ab624a823ace14e9c5f7e24dfb8f_qvelus.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/cf4d6784b45e8821ece8399d310738a386052aba91098a7c_ogmqyn.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/09e502a2ce6e26469b1f4c5bf332f2006340f92c51c969f5_evsyrq.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/5370c71dc10127345d99c8e59b4b568458fa0147f660368b_e3b1ff.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/560cfc1d960830ff98de6015f961cab01ab881985c7bb541_hnlmrl.avif",
    ],
  }),
  "god-of-war-ragnarok": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/1f4bf1ee42276b3841e71ebb812510493ce78bfc307d3296_qdf1d2.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308241/God_of_War_Ragnar_C3_B6k_capa.jpg_cajyo5.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/NbH8trRlNM7tXO8cPm4Bfkew_zsdw8i.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/bs47a1TJb585Z0MtRQKRW5er_wvl1sy.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/WERD9QwOeuJ257snQnLhOob8_nrudgg.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/gjZf7QAeZ195d7KKPVHLM6QU_thszqc.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/MYG8s9nxUeFtDiAKaxvkRzwF_jdmm7b.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305789/IPb3Z7rbbC39jXRVTIgM1vcw_axcqd4.avif",
    ],
  }),
  "god-of-war": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/KAmUQWQ5V9QF3XDzmty1VkKj_xdyurb.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/LsaRVLF2IU2L1FNtu9d3MKLq_bpzydt.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/PREVIEW_SCREENSHOT1_152721_fstpqi.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/PREVIEW_SCREENSHOT2_152721_qjekvt.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305792/PREVIEW_SCREENSHOT6_152721_kqxrsm.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305792/PREVIEW_SCREENSHOT3_152721_iexyqu.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305792/PREVIEW_SCREENSHOT5_152721_efdxw6.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/PREVIEW_SCREENSHOT7_152721_bwzyyz.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/PREVIEW_SCREENSHOT8_152721_pulnjf.avif",
    ],
  }),
  "gang-beasts": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/pXC7nJzBiN8m9VswrBZUid4S_fak1wy.webp",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307619/apps.35593.68150164172276526.ddc374d7-ef5e-43b9-940a-bbc04440bb33_k0tho9.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/2kZcm1OOdNpBufLRjkzZtfnv_ml6lmi.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/1h3ap4ZwW7zYZXgBnTSSJdoC_ohrrxa.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305794/q4Exwcr9q3dnb4lNkV9DcXF3_geinzf.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305794/243vNOrtYaXTTY1gXInkUuk4_uwmxgq.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/icmz1iQRCSUOYlrqPMuAyxX3v_hqburc.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/LdmZRQDHjacJkU7jGNwNkSqD_aneupy.avif",
    ],
  }),
  "metal-gear-solid-delta": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/40644e8efe1a34b361adcd5d22283444e0ee12fcf9783479_qojrlt.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308021/13093424477046.jpg_ojghav.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/46104018b61828982144fb4143fa22feb8af8dd3b6928557_bgdzj0.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/17ebc3943be34b5f2939be89cbe0224cb6497b6f0de6cbe1_jmu6fw.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/7c1a55246937ca9cd0b97f27406b160ed12ab1ecf3e40f5e_r2dcap.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305799/00ca61180b5be75e30a03cdf988c8b03b7687da9a8a8c6f6_ungxmi.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305799/f710e938347567ceb9410d36f17f137ff20bddff078afdcb_tmu5uy.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305799/3db1a8c5dfb382d18c48dae2af54f60b84a897a987b3727d_km1lns.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307122/6a7ce4bfb6e642c717dd8a56817ce6dfe1636a285664bed6_anzgne.avif",
    ],
  }),
  "days-gone-remake": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/cdf6431ee3f30fde3c13b42857d41edc42142da11e1bdc61_a0hd1p.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/a2fa690381bb625c8efca0bbd5210811b9e044ed6f116ab8_qbwkuk.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/fd748611c48677afcef1bc86f54f434975725490922037f3_toqxn8.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/07e3cbc0ef39ec3a4bd862ac25688ae528dea1ef1c9a32b5_ajnpdy.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/ff80f7cceea59534c7ed676b383ce6c3d954d98cea2045fd_uvzuvf.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/0c0e0fc330d42c94fc1dfdce600a693177a33812990df571_jge15q.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/50c5441b6bada7aad6327618ce0436150616cc9babe17de7_pl1kvr.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/58917f6cb6f4d55d427957ccfa73b3c1207a612bb91a138d_di8vua.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/15d0b8414e37a40eb61a53f6bead755ef704e1699bd9eecf_j5embw.avif",
    ],
  }),
  "god-of-war-3-remastered": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305742/qKv4pRqoGFvnoUKyDSLg17ne_b1kv5w.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786311858/god-of-war-iii-remastered-playstation-4-playstation-store-cover_pwfqj1.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_8_jgxx0b.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_2_rryxoj.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_9_svji1w.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_4_smqccd.avif",
    ],
  }),
  "battlefield-6": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305740/499e810a69aecf9bca5e65daa391ad9fb212b6d17bd230a3_c0f3y0.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/aa972ae00b4f52514faa64d6626c43fe92ca880b250fa485_pzozlf.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305740/1dc001a065e8494cff98c986044363bcd2702a6c7442f926_cdkng0.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/16e87f0ace49b69774dd829c279fcf032eb21927818f1473_pk8sg8.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/4b0674c633720a66d0811adf557162b98cd4011aeb06df4b_xalylg.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/6193a0bab1b1fda68f517e52958143437f77c12a3db2e05b_inand9.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/0fc79385f4b9aeb80608dfc229ad0bbcc45ed783eaae7a2a_oudxi3.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/82d15c5c148aae2906c24f414447fac0c36d5736fe0e53d9_webkpi.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/5be2e3f9827b6c838807c1c7716b3acd9b57cc299c5960cc_euobtj.avif",
    ],
  }),
  "doom-the-dark-ages": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/9cce1948120d31351ecd5d9715fffe9ffc0041be81767b45_nvrzgr.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/bb3f89ae3425f3aa86041ff71646fc5d44d7705f3a383427_q7twzo.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/6e2b6c98d0288a93def5d186504a68efc2860c7a8262ed20_lhytwa.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/b2f73f8185e0deda697df52f80091ae99199fb19fdcbbf46_wfeijq.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/78ee91a3dc2ac0f05e2eabaab691eab94e8546be8e860747_csjdng.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/5ba37b7c0954394dad1584b6bacce62526e6b18db8ce6136_jdtk3k.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/be7fe0044a833ab346a55daca3cc439fd7a70ccc80a34c9c_ajkyub.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/d6f20a4679ef37b1f0e06444499a89fc2699dada89f91ac1_wsya63.avif",
    ],
  }),
  "demon-slayer-hinokami-chronicles": media({
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/9b8b59b311dd2d8555f7d3a862369e888c2ebcd389ca88d2_cxm2kh.avif",
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786308270/2ZfAUG5CTXdM34S1OhmMW1zF_yfq4sm.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/ddfc7334f0360433a48686cf67ed8f5bd0ba4d4fa5a60d4b_jcjabc.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/58ef9804d2fe7d273e0e40ac1f7d09ebaff15fccebbed785_znxhig.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/eb4ce78fc4ffada1440240b1e15870a42daeeb1999cd75f6_unpzka.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/8b870159336a620e3ba8ae5150508c038cb99c8e684b2c8e_pcgp9d.avif",
    ],
  }),
  "genshin-impact": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334454/genshin-impact-40jjf_bhspko.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333492/588720a686e20fc3d0ed0fa5d42b10d0981341dde320e3c6_le2n0z.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/ee8fc561d32640042cfc52f98f1eddb9e7529eafc39c60a0_ivgfir.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/acdc8c4afc1b17bbeb7c961a4c2dbb2636e20b8cf0515a0a_vtdidz.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/c50d3976bafdb642fd8c384a22a9dd81affb5f1bf363c04f_ycwqgd.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/b969913e8a04f2c4ab6ca10173856162d65c1c352a015322_u3jpvu.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333490/85390fe18f86b8480ab0a69a6bddbb9f75d4fb75745e8168_u2niqn.avif",
    ],
  }),
  valorant: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334412/apps.21507.13663857844271189.4c1de202-3961-4c40-a0aa-7f4f1388775a_kxqhwh.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333490/f70950c34b58491e273fa8ef1bcb0022bc633537921934d8_meaz5j.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/2c1e9886a14f934916259b5dc12e95e5d3857aa789cf07b5_dksuvy.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/57ba040780f841303f990276a1163357db7ddd4fc73e891e_edjprg.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/31ecfb2e24d112b6a4cd318470b2b1ce80bd340885feac97_loclbb.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/8ca49a8478ab4f4b1093fb6ebca67e0ca5a3adb7d1c037be_gw3w2r.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333488/9c98fba4828d6739e4c35635f251fb18d81568657a65587f_hmrbty.avif",
    ],
  }),
  "resident-evil-requiem": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334340/images_gkkjyq.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333488/3878ff92261c1fda7ce03772ac149514ce6f6bf5c715e64b_ay64zk.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333488/b2ee4bb116cbc638d085ccf6f8a70926e23a945810ef8696_hvryvg.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333487/0defaa05f3a37f4340975cb80cbd328462d6f9af93c115b0_jfso0t.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333487/42738d3e42f78fab129efa703bd39b56c223d1e9aff488cd_okovcg.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333487/85f70c7da036a82417a2c4e9bf9dc6876320e22c25def9d9_hfzdmx.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333486/f8fc0bb33bb532fd955efc69f5206a487507361406213583_sjn2qk.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333486/53835b4d3bd76248d5df4ea114f851da584ad3dee93170a5_cpt3uq.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333486/b63335ca9f101e01db8bc3a61e3941abfc4658e50f84f4d5_p9fmut.avif",
    ],
  }),
  "arc-raiders": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334174/apps.1218.13550041517005289.7f3b0841-0084-4cae-88f4-8996d95d574f_ejtndw.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/1ba134fed235d21ae7ae2588ed379fbb2eb24e1574dd6dad_crpzlp.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/d8fe1cbb0a3f30673003363089667bc932e5bd1f2f4ab4b2_fjelb8.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/545919c3eb68b7a80f26585a9eb213f62cd8bfa1da4c52a5_jfxogb.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/1854db4af5285cf9e6a2d5e64188f2cf61dcf373e12cc8db_e3cdwz.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/e52c17aca8d3dedc85e586c97502787ddf22b6823684b6c9_kfkntp.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/8cbbaa5b92d0ce745153ac6ea4ab5083546729e80b792023_dwytxx.avif",
    ],
  }),
  "marvel-tokon-fighting-souls": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334153/cover_voessc.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/71b37be111798b6f8e9f9413474e882603867affbbea6b4d_clj0eh.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/4815eb3172d0243de81381930283979e6c50857cb51aafc1_dels6m.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333483/00158ca9b06407610e5e73c38547f46538e4c4f4c87ee052_rzngcx.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333483/eea10430815adb7a5995097fd5ab8d30002e2ffeb4b95712_sz3x1p.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333483/5c395b96290fc72c7244d94fbe15cdf3e0ec8a5342bb9cf8_lhwl9v.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333482/0f36058edd06e73dfd9028fca0fc3582b7c237642b98e0bc_e7ubpm.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333482/973f3b7807d55b4c3cc556d50ba38f8056545bf5f42e937e_k7brjh.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333481/61ca8f3b7dc02bdf0a3719be7d4771c549617fc4e9773ccd_jgyoya.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333481/2786fb5d2958f181e836bc8d7c2c2424b0ad6b9a47f04724_f028fa.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333481/f127f61a7cdf328577b55767b95a8a0e5a9f9c6fc3cfddbd_mw6a6i.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333480/47646bc6f0b4d839aa64a21350978f84956db3dd979244ab_hzid8b.avif",
    ],
  }),
  "spider-man-2": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334040/e66c4ae18c5d8e3986a24599b293162a6f5c9eba22968d2c_mlcj65.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333480/97e9f5fa6e50c185d249956c6f198a2652a9217e69a59ecd_kcwazg.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333480/2c98c3222259f47462e6d7cd596e7e6bb2c9c0ff2ed314f6_fxynbj.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/21b32023d0332afe6f2fa5ae74d66ceea4fa82212922135a_zoedzd.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/e2293c139402f6a14ffb7b69ea4da5fbfd58939bd9bccd5b_rbeug2.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/023d3a703dd14e4b76534132d18e5a648c3bd1b2f3f082ea_hwcwg1.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/ca4fa327f917323de1822c3511640700f11af3772b4d0cf1_galwzr.avif",
    ],
  }),
  roblox: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333943/roblox_ensino_j6uqjp.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333478/6157a74f216f5fd380f33d326132130e6d1d7578291da74c_mqucsh.avif",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333478/44cc9e6950a383e88a43b0876d7926cf32a678c8788ecbbd_dmn2q8.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333477/ad591a0097eee07d2ac0de67d464d0ffcf4e86c40a2ed023_udr6xf.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333477/8055b401120af0b02f837e042937bce377844b34bd70936d_ythrve.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333477/fbb0338a4bed3b8d1d43085e9df587b53cd74c37ba877202_srsq0w.avif",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/910edf5bb055b7dcb8fb506ecd318a8a8b6028a8b952aced_kperpc.avif",
    ],
  }),
  "free-fire": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/MV5BMTI3MTE3ZGQtNWJmMi00MTAzLWI2MzYtZTFiMDRkMzU0ZjE0XkEyXkFqcGc._V1__ogfwwd.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333474/65fef1213324415a00e170bef3a51e2b_tmmriz.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/maxresdefault_2_gvqstl.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/images_iikqog.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333475/maxresdefault_1_kgvzjr.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333475/images_1_ydnkdx.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333475/unnamed_hgjuf1.webp",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/hq720_u8kemt.jpg",
    ],
  }),
  "league-of-legends": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/apps.18996.14127010465288187.f9de4a96-0ee4-4da3-bf66-d4132b38c599_jic6oh.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333899/image_principale_lol_0d328e25-2895-428d-a871-34cccfda67ae_v7vvna.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/99691af754da3fdb0f9c122530db5048c7a2e168-1920x1080_tphmvi.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/images_2_ruzmac.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/Udyr_3.jpg_l2nzov.webp",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/147753-lol-article_cover_bd-2_tsjdyi.webp",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/league_of_legends_novas_skins_florescer_espiritual__254tlno0_q2f5zy.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/LeagueofLegends_NoxusSkins_SeasonOne_MasqueoftheBlackRoseVladimir_Splashart_rd5ori.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/2b5f2946482626a0718f4a124ffcf55c6250c8ad-1215x717_rezexp.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/1ddf258f6a27414a83067d14cca91e3afdb13af9-1215x717_kprecn.jpg",
    ],
  }),
  "marvels-wolverine": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335533/5ba04b023e0b4c4aa7fbdbf2170262a52bc0384ee44efce0_tmdu2a.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335509/2e98d11ecc5fc86cf404d0f4b7b4a1ba5774a51bf3db0020_kyxiig.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335575/55310752343_8b1160b229_4k_eiosqo.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335582/marvels-wolverine-gameplay-brutal-state-of-play_dzage1.webp",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335585/wolverine-marvel-sony-rolling-stone_enmflr.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335611/wolverineb.jpg_oi10qu.webp",
      "https://www.einerd.com/wp-content/uploads/2025/09/552413441_18525434383026398_4040425915169076594_n-1024x576.jpg",
    ],
  }),
  fortnite: media({
    cover:
      "https://i.redd.it/why-roblox-is-seen-as-for-kids-but-games-like-fortnite-or-v0-d6fhyley7c4c1.jpg?width=1000&format=pjpg&auto=webp&s=67f63774e9d4f2d5d9fbc75527924b9add9c01c4",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335787/uptodown-fortnite-epic-games-store-battle-royale_xkczdd.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336121/imagem-2024-12-11-175848969_fzbkfp.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335971/maxresdefault_gbydxc.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335983/Imagem-07-08-2026-as-18.20_qfi6lc.png",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336126/PZwgUkS8NwAym9tokx97Vn_uflq3b.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336124/fortnite-01_xhayst.jpg",
    ],
  }),
  "apex-legends": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335918/94825_viltsw.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335835/b7710f94cae71eb1e149b3b658a22e24e022accebba4880f_c61bb1.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335837/005b8b83efad77f7ac511a163035857070e51e610260b747_namubt.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335842/fa6cffe59160a10d800e9c8e76feecf00c0c8c68c4db89e6_zqlypx.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335839/9ac130bed625dd2f27ccb88ce4c7221b7cb49cd8af589e7c_v4pjah.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335923/apex3_r1unbv.png",
    ],
  }),
  pubg: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336208/pubg-pc_1280x720-800-resize_gr0m0j.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336132/PUBG-Screen-03_roi2ym.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336246/images_xkood1.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336238/Aq0F4oV6_q5ygti.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336275/images_fjw7eg.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336278/dd4e4db38323102089c82ecdb193908fbeb93bbd80d210c2_uzx7oz.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336280/88db5bf_b03z1b.webp",
    ],
  }),
  "the-last-of-us-part-1": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336388/JKqkaz5Sy6AvH2fZAVdjTxR8_ypqdvx.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336388/JKqkaz5Sy6AvH2fZAVdjTxR8_ypqdvx.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336400/8qNEBMsYiPgIfmGmmi49jdO9_suy0ti.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336408/ETNxL6Q3oHcXGuTM7lKNmEPC_ggeghb.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336413/6nNniLbi1lIxtrkVhsR6RBU9_ylicpa.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336415/mfCn8HhUv1cBfh6m6HkjG0tN_aijwyp.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336418/qpAUFYXSVRlSN0Z1MSKXPu92_zes8zi.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336421/XrinjHHmA699ahvDroE7Mmoa_erf2tq.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336423/fwAXxU3rbbRVJABaov6bMfYA_sa0cvc.jpg",
    ],
  }),
  "doki-doki-literature-club": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336528/MV5BZmJhMTkwMDEtNDU2Yi00MjNkLWIwNDYtMTZhNWM1ODgyZDI3XkEyXkFqcGc._V1__fhswb3.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336568/3xIQlFWEBEUNrbSOpbUxu7Pd_ydsj1t.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336565/ss_3941e57f278958dd15c9855f42ab069da3a19608.1920x1080_ha5q0f.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336637/ss_2ba08e22d1a3226a85b19e682b3cf88960c9f190.1920x1080_q9cftd.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336640/RjN13xW3n1RxqMyFSM2nEzqU_yvswvf.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336643/yiQGUhNNvr0KqEp8xrj7yab5_pfbxfw.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336646/maLXGPNpjJmyGeAJ8uRdRSgt_ivx0kk.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336649/r1kWWVKxktLTOSz75cSjpeKg_f3urhl.jpg",
    ],
  }),
  "horizon-forbidden-west": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336742/SqRcyLjZbpK26ej6TnWf43xp_lbh49m.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336767/yKyAgL4hV8wgDMgN0tcerpzO_f1gruo.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336756/cGMjVMO5g2yPS9bjwL5CGyGE_nzpv13.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336758/paxX30u6PJZWTIywCzTjQ8XQ_v6nons.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336762/S6OtFMhSYw0m1GYRTykhGDs6_bo1pzd.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336764/JEpfvm4xHpYTmXyz12vWRCR5_y216tt.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336772/VYOttvPGju7LvJKD65OGeT41_uousfs.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336775/goSNxvzTBXhNy965YPXGM906_z2wu1g.jpg",
    ],
  }),
  kandidatos: media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369002/4e6d49ddedcb7c3edde61148ceda4953_r8ymg6.png",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369021/maxresdefault_fblvmp.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369038/ss_2acf9559421dd59bd85822eaf17ca0e5262831d7.1920x1080_omknin.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369074/ss_5164c684ce6e1f46cf4a275ff700b77c0d7f3843.1920x1080_vwknfy.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369070/ss_9156e5d4fde11b878f9219c13b7f5762a8d504ed.1920x1080_i147eh.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369056/ss_eae1222db15cbca40e97ce4606104102f0e632cf.1920x1080_wtuzvu.jpg",
    ],
  }),
  "persona-5-royal": media({
    cover:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369475/899500_front_qaf8ku.jpg",
    banner:
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369284/ksJmxHAF3c4PV9N7MRvLCeWb_usfwo7.jpg",
    screenshots: [
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369290/oAyxg9w4rLSSbIK91wzvaby6_jbeyuq.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369322/rKJ656smMK3g3cAwIVFeAdgS_a8tdht.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369333/QZuvnoBy0DhHj8CH5znQLIpL_vu4jgg.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369313/F4rgmdmQH5Wvj9cA0sLHOKxj_un05kv.jpg",
      "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369351/CKIWUxnh85P9sLV1vRfXCqMj_jncnez.jpg",
    ],
  }),
};

export const seedPosterBySlug = {
  "hollow-knight":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976547/hollow_fij6gq.avif",
  "hollow-knight-silksong":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976546/silk_mbrzoi.avif",
  "assassins-creed-black-flag-remake":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976546/blackflag_ns2rvc.avif",
  "grand-theft-auto-vi":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976548/gtavi_rerqc6.avif",
  "elden-ring-nightreign":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976545/night_aiiepe.avif",
  "elden-ring":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976545/elden_ybyqim.webp",
  "eldest-souls":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976544/eldest_c72xw6.webp",
  "hades-2":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976543/hades2_aexewa.avif",
  "call-of-duty-modern-warfare-4":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976542/modernwar4_nsgjew.avif",
  "dragon-ball-sparking-zero":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976541/sparkign_wdn07w.avif",
  "the-witcher-3":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976541/witcher_hmrpgu.avif",
  "cyberpunk-2077":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976540/cyber_qoorlm.avif",
  minecraft:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976539/mine_a464rw.avif",
  "marvel-rivals":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976539/Marvel_Rivals_ogypwa.avif",
  "halo-campaign-evolved":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976352/halo_iijmgv.avif",
  hades:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976543/hades_fk6xfc.webp",
  "demons-souls":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976352/demons_souls_h4tlbj.webp",
  celeste:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/celeste_lrby4w.avif",
  "dark-souls-3":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/darksouls_a2x95o.jpg",
  "red-dead-redemption-2":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/red_ctn8d7.avif",
  "stardew-valley":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/stardew_f9oz6e.avif",
  "gta-5":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305802/oltI7Zc96usbdvhVVXcV1EAigtasquare_epfps5.webp",
  "baldurs-gate-3":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/ba706e54d68d10a0eb6ab7c36cdad9178c58b7fb7bb03d28_ky0gxn.avif",
  "god-of-war-ragnarok":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305767/P8AN9kNfSJtfSx0PmlT93mnN_g2ooq8.avif",
  "god-of-war":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305742/ax0V5TYMax06mLzmkWeQMiwH_q3xbhp.jpg",
  "gang-beasts":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307127/DaMDXP75LV9pti5nA2IALzhO_qxi3ul.webp",
  "metal-gear-solid-delta":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307123/d35b305652ee922a72b4020bd5d6ef36675cf526dd4945d1_uxxixv.avif",
  "days-gone-remake":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/a2fa690381bb625c8efca0bbd5210811b9e044ed6f116ab8_qbwkuk.avif",
  "god-of-war-3-remastered":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786311858/god-of-war-iii-remastered-playstation-4-playstation-store-cover_pwfqj1.jpg",
  "battlefield-6":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/aa972ae00b4f52514faa64d6626c43fe92ca880b250fa485_pzozlf.avif",
  "doom-the-dark-ages":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/bb3f89ae3425f3aa86041ff71646fc5d44d7705f3a383427_q7twzo.avif",
  "demon-slayer-hinokami-chronicles":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786307116/JzL1NLQvok7Pghe9W5PP2XNV_wflum1.jpg",
  "genshin-impact":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333490/30935168a0f21b6710dc2bd7bb37c23ed937fb9fa747d84c_dyvivu.avif",
  valorant:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334425/tecnologia_20e_20games-games-valorant-call_of_duty-1721677606_emjfbj.jpg",
  "resident-evil-requiem":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334338/resident-evil-9_q75h_futvg4.jpg",
  "arc-raiders":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334294/images_dmoyfc.jpg",
  "marvel-tokon-fighting-souls":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334130/marvel-tokon-fighting-souls_dc82_a7svp3.jpg",
  "spider-man-2":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786334040/e66c4ae18c5d8e3986a24599b293162a6f5c9eba22968d2c_mlcj65.jpg",
  roblox:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333478/12278d7eaa31b8e9afe79e98f5017d4522b3ac51c7635826_smbidm.avif",
  "free-fire":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/garena-free-fire_2e8s_quw5e0.jpg",
  "league-of-legends":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/lol-banner_jr3grz.webp",
  "marvels-wolverine":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335506/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322_qgfile.jpg",
  fortnite:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335803/maxresdefault_glcrxv.jpg",
  "apex-legends":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786335823/b48e1eb395ffbbb4523ecbaf169b44c010ffed2dd0b526b0_k8gkbg.jpg",
  pubg: "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336128/a667297e99ffe4f306b1b513ffd1f38b429ab22ab4848408_nximds.jpg",
  "the-last-of-us-part-1":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336381/eEczyEMDd2BLa3dtkGJVE9Id_ucs4li.jpg",
  "doki-doki-literature-club":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369812/N7ihNMs56mxfYpLu3h7KjtGi_nuagi5.jpg",
  "horizon-forbidden-west":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786336862/ki0STHGAkIF06Q4AU8Ow4OkV_njz4zy.jpg",
  kandidatos:
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786368986/3320953-5358214920-rOW6cDC8QLo8y2xzF7104pXMmiXSyLC6RVMjl3YYl6cBkpYNWf18dxTYTsvkMfP5GZw_3Ds180_yhqkmb.jpg",
  "persona-5-royal":
    "https://res.cloudinary.com/meguitooooooo/image/upload/v1786369252/OjPcc6QP2W8kImOhWSnzojn3_ftucvg.jpg",
};

export const seedCatalogGames = [
  catalogGame({
    id: "catalog-silksong",
    title: "Hollow Knight: Silksong",
    slug: "hollow-knight-silksong",
    description: `Jogue como Hornet em um reino novo, enfrente inimigos e desvende os mistérios de Pharloom.

Capturada e levada ao reino de Pharloom, Hornet precisa escalar rumo ao topo de um território montanhoso dominado por seda e reis esquecidos, revelando uma mitologia distinta da de Hallownest, porém igualmente sombria e enigmática.

Hornet luta com sua agulha e uma variedade de técnicas de seda, unindo agilidade acrobática a um arsenal mais ofensivo que o do Cavaleiro original, com novas ferramentas de mobilidade e um sistema de crafting que personaliza habilidades ao longo da jornada.

Após anos de desenvolvimento aguardado pela comunidade, a Team Cherry expande a direção de arte desenhada à mão e a trilha sonora atmosférica da série, prometendo um mundo ainda maior e mais denso que o primeiro jogo.`,
    price: 59.9,
    releaseDate: "2025-09-04",
    categories: ["Ação", "Metroidvania", "Plataforma"],
    tags: ["Indie", "2D", "Exploração", "Desafio"],
    publisher: "TEAM CHERRY",
  }),
  catalogGame({
    id: "catalog-ac-black-flag-remake",
    title: "Assassin's Creed Black Flag Remake",
    slug: "assassins-creed-black-flag-remake",
    description: `Retorne aos mares do Caribe como o pirata Edward Kenway nesta recriação de uma aventura de ação, furtividade e mundo aberto.

Nas Índias Ocidentais do início do século XVIII, Edward Kenway busca fortuna rápida e acaba se envolvendo com os grandes nomes da Idade de Ouro da Pirataria, além de ser puxado para o conflito milenar entre Assassinos e Templários que molda o pano de fundo da franquia.

Combates navais dinâmicos permitem abordar, saquear e afundar embarcações inimigas, enquanto a exploração em terra mistura parkour urbano, infiltração em fortalezas espanholas e mergulhos em destroços submersos repletos de tesouros.

A recriação revisita um dos capítulos mais queridos da série com tecnologia gráfica atual, prometendo manter a atmosfera de liberdade caribenha que consagrou o jogo original como favorito dos fãs.`,
    price: 349.9,
    releaseDate: "",
    categories: ["Ação", "Aventura", "Mundo Aberto"],
    tags: ["Piratas", "Naval", "Furtividade", "Caribe"],
    publisher: "UBISOFT",
  }),
  catalogGame({
    id: "catalog-gta-vi",
    title: "Grand Theft Auto VI",
    slug: "grand-theft-auto-vi",
    description: `Jason e Lucia tentam sobreviver ao submundo criminoso de Leonida, um estado inspirado na Flórida.

Ambientado no estado fictício de Leonida, o jogo acompanha a dupla romântica formada por Jason e Lucia em uma trama de crime, traição e sobrevivência que marca a primeira protagonista jogável de destaque na história principal da série.

Vice City e seus arredores prometem o mundo aberto mais detalhado já construído pela Rockstar, com um ecossistema urbano vivo, IA de NPCs aprimorada e a alternância entre os dois protagonistas influenciando diretamente missões e estratégias de assalto.

Desenvolvido pela Rockstar Games como sucessor de um dos jogos mais influentes da indústria, o título carrega a expectativa de redefinir os padrões técnicos e narrativos do gênero mundo aberto.`,
    price: 0,
    releaseDate: "2026-11-19",
    categories: ["Ação", "Aventura", "Mundo Aberto"],
    tags: ["Crime", "Vice City", "Leonida", "Rockstar"],
    publisher: "ROCKSTAR GAMES",
  }),
  catalogGame({
    id: "catalog-nightreign",
    title: "Elden Ring Nightreign",
    slug: "elden-ring-nightreign",
    description: `Ação de sobrevivência cooperativa para até três jogadores, com personagens próprios e ciclos de três dias e noites.

Cada partida ocorre em um mapa que se reconfigura a cada ciclo, forçando os jogadores a escalarem seus personagens rapidamente através de saques, chefes de campo e eventos ambientais antes de enfrentar o Senhor da Noite ao final do terceiro dia.

Personagens exclusivos, cada um com uma classe e habilidades únicas, substituem a criação de personagem tradicional da série, aproximando a experiência de um roguelike cooperativo sem abrir mão da atmosfera sombria e do combate técnico característicos da FromSoftware.

Ao adaptar a fórmula Souls para sessões mais curtas e cooperativas, a FromSoftware experimenta um formato inédito dentro do universo de Elden Ring, mantendo a direção de Hidetaka Miyazaki como supervisor do projeto.`,
    price: 199.9,
    releaseDate: "2025-05-30",
    categories: ["Ação", "RPG", "Roguelike"],
    tags: ["Soulslike", "Co-op", "Sobrevivência", "FromSoftware"],
    publisher: "FROM SOFTWARE",
  }),
  catalogGame({
    id: "catalog-eldest-souls",
    title: "Eldest Souls",
    slug: "eldest-souls",
    description: `Boss rush soulslike em pixel art: enfrente os deuses antigos e salve a cidadela de uma desolação iminente.

Os Antigos, deuses outrora adorados, se voltaram contra a humanidade e foram aprisionados na Cidadela. Como último remanescente da Ordem, cabe ao jogador enfrentar cada divindade em batalhas individuais para conter a desolação que ameaça consumir o que restou do mundo.

Cada chefe funciona como um quebra-cabeça de padrões e janelas de ataque, exigindo leitura precisa de telegraphs e gerenciamento de uma barra de fúria que intensifica o dano em troca de maior risco, em um design de boss rush direto e sem enrolação.

Com pixel art detalhada e chefes de escala monumental, a United Label entrega uma experiência compacta que homenageia o design de Souls-likes clássicos sem depender de um mundo aberto extenso.`,
    price: 49.9,
    releaseDate: "2021-07-29",
    categories: ["Ação", "RPG"],
    tags: ["Soulslike", "Boss Rush", "Pixel Art", "Indie"],
    publisher: "UNITED LABEL",
  }),
  catalogGame({
    id: "catalog-hades-2",
    title: "Hades II",
    slug: "hades-2",
    description: `Como a Princesa imortal do Submundo, use feitiçaria sombria contra o Titã do Tempo em um roguelike de ação.

Como Melinoë, princesa imortal do Submundo, a protagonista enfrenta Cronos, o Titã do Tempo que escapou do Tártaro e ameaça consumir a linhagem dos deuses gregos, expandindo a mitologia familiar apresentada no primeiro jogo com novos deuses e vilões.

Feitiçaria substitui parte do arsenal físico do jogo anterior, com magias, invocações e uma nova mecânica de Ômega que transforma ataques carregados em habilidades devastadoras, além de permitir explorar tanto o Submundo quanto a superfície grega.

A Supergiant Games mantém a direção de arte refinada e a trilha sonora marcante da série, desta vez em acesso antecipado, incorporando feedback da comunidade antes do lançamento completo.`,
    price: 89.9,
    releaseDate: "2025-09-25",
    categories: ["Ação", "RPG", "Roguelike"],
    tags: ["Mitologia Grega", "Indie", "Dungeon Crawler", "Roguelike"],
    publisher: "SUPERGIANT GAMES",
  }),
  catalogGame({
    id: "catalog-celeste",
    title: "Celeste",
    slug: "celeste",
    description: `Ajude Madeline a escalar a Montanha Celeste em uma aventura de plataforma precisa e emocional.

Por trás da escalada está uma metáfora sensível sobre ansiedade e saúde mental: Madeline confronta um reflexo sombrio de si mesma, Part Madeline, em uma jornada de autoaceitação tão importante quanto os desafios de plataforma que ela enfrenta.

O design de fases é preciso ao milímetro, com pulo, dash aéreo único e escalada de paredes formando uma linguagem de movimento que se expande constantemente com novas mecânicas por capítulo, culminando em níveis B-Side e C-Side extremamente desafiadores para veteranos.

Criado por uma pequena equipe liderada por Maddy Thorson, o jogo é aclamado pela trilha sonora eletrônica de Lena Raine e pela forma como a dificuldade acessível (com modo assistido opcional) convive com um design de precisão hardcore.`,
    price: 36.9,
    releaseDate: "2018-01-25",
    categories: ["Ação", "Plataforma"],
    tags: ["Indie", "2D", "Narrativa", "Desafio"],
    publisher: "MATT MAKES GAMES",
  }),
  catalogGame({
    id: "catalog-cod-mw4",
    title: "Call of Duty: Modern Warfare 4",
    slug: "call-of-duty-modern-warfare-4",
    description: `Shooter militar de ritmo acelerado da série Modern Warfare, com campanha, multiplayer e modos cooperativos.

A campanha aposta em missões cinematográficas de ritmo acelerado, infiltrações táticas e sequências set-piece de grande escala, enquanto o multiplayer oferece mapas variados, progressão de armas profunda e modos que vão de Team Deathmatch a operações em grande escala.

Como parte da sublinha Modern Warfare, o jogo aposta em realismo militar contemporâneo, com motion capture detalhado e um modo cooperativo que expande a narrativa além da campanha solo, mantendo a fórmula consagrada da franquia.

O suporte pós-lançamento inclui temporadas de conteúdo gratuito, eventos ao vivo e integração com o modo battle royale da série, sustentando uma base ativa de jogadores ao longo de todo o ciclo de vida do título.`,
    price: 349.9,
    releaseDate: "",
    categories: ["Ação", "FPS"],
    tags: ["Call of Duty", "Multiplayer", "Shooter", "Modern Warfare"],
    publisher: "ACTIVISION",
  }),
  catalogGame({
    id: "catalog-sparking-zero",
    title: "DRAGON BALL: Sparking! ZERO",
    slug: "dragon-ball-sparking-zero",
    description: `Lutas em arenas 3D que retomam a série Budokai Tenkaichi, com elenco amplo e batalhas destrutivas.

Com um elenco que ultrapassa 180 personagens de toda a saga Dragon Ball, o jogo revive arcos clássicos como Saiyajin, Freeza, Cell e Majin Boo através do modo Episódio Batalha, recriando momentos icônicos do anime com liberdade para explorar rotas alternativas.

O combate mantém a essência frenética da série Budokai Tenkaichi: voo livre em arenas totalmente destrutíveis, transformações espetaculares e combos que podem encerrar lutas em segundos, exigindo leitura rápida de guard breaks e contra-ataques.

Desenvolvido pela Spike Chunsoft sob licença da Bandai Namco, o jogo é aguardado havia mais de uma década pelos fãs da franquia, entregando visuais que recriam fielmente a estética do anime em batalhas de escala cinematográfica.`,
    price: 279.9,
    releaseDate: "2024-10-11",
    categories: ["Ação", "Luta"],
    tags: ["Anime", "Arena Fighter", "Dragon Ball", "Multiplayer"],
    publisher: "BANDAI NAMCO",
  }),
  catalogGame({
    id: "catalog-marvel-rivals",
    title: "Marvel Rivals",
    slug: "marvel-rivals",
    description: `Hero shooter 6v6 gratuito com heróis e vilões da Marvel, sinergias entre equipes e ambientes destrutíveis.

Cada herói pertence a uma equipe temática do universo Marvel, e a formação de duplas ou trios de personagens específicos ativa sinergias de equipe que concedem habilidades combinadas exclusivas, incentivando composições estratégicas além da escolha individual de personagem.

Os mapas incorporam elementos icônicos do universo Marvel, como Tóquio 2099 e a Torre Stark, com estruturas destrutíveis e verticalidade que abrem espaço para jogadas criativas de heróis voadores ou com mobilidade elevada.

Publicado pela NetEase Games em parceria com a Marvel Games, o título gratuito recebe atualizações sazonais com novos heróis, mapas e eventos, buscando espaço em um gênero dominado por hero shooters consolidados.`,
    price: 0,
    releaseDate: "2024-12-06",
    categories: ["Ação", "FPS"],
    tags: ["Hero Shooter", "Multiplayer", "Marvel"],
    publisher: "NETEASE GAMES",
  }),
  catalogGame({
    id: "catalog-halo",
    title: "Halo: Campaign Evolved",
    slug: "halo-campaign-evolved",
    description: `Remake expandido da campanha que iniciou Halo, reconstruído com visuais modernos, três missões inéditas e co-op.

A campanha revive o primeiro contato entre a UNSC e o Covenant no anel-mundo Halo, seguindo o Master Chief e a IA Cortana em uma luta pela sobrevivência da humanidade, agora enriquecida por três missões inéditas que preenchem lacunas da história original.

O combate mantém a tríade clássica de arma, granada e melee que definiu os shooters em console, reconstruída com física, iluminação e IA de combate modernizadas, além de suporte completo a cooperativo para revisitar o anel-mundo ao lado de outros Spartans.

Sob responsabilidade da Halo Studios, o remake busca equilibrar fidelidade nostálgica com padrões técnicos atuais, reafirmando a importância histórica do título que ajudou a consolidar o gênero FPS em consoles.`,
    price: 249.9,
    releaseDate: "2026-07-28",
    categories: ["Ação", "Ficção Científica"],
    tags: ["FPS", "Campanha", "Co-op", "Master Chief"],
    publisher: "HALO STUDIOS",
  }),
  catalogGame({
    id: "catalog-demons-souls",
    title: "Demon's Souls",
    slug: "demons-souls",
    description: `Remake do clássico de fantasia sombria que estabeleceu as bases do gênero Souls.

No reino amaldiçoado de Boletaria, uma névoa profunda desperta demônios antigos e aprisiona almas dos vivos. Como um dos poucos capazes de entrar e sair da névoa, o jogador precisa restaurar a ordem enfrentando os Arquidemônios que corromperam cada região.

O sistema de tendência de mundo, que alterna entre pureza e negrume conforme as ações do jogador, altera a dificuldade e a aparência dos níveis, uma mecânica pioneira que antecipou muitos dos elementos hoje associados ao gênero Souls-like.

Refeito pela Bluepoint Games para PlayStation 5, o remake reconstrói integralmente os visuais e a trilha sonora original da FromSoftware, sendo aclamado como uma das recriações gráficas mais impressionantes da geração.`,
    price: 349.9,
    releaseDate: "2020-11-12",
    categories: ["Ação", "RPG", "Fantasia"],
    tags: ["Soulslike", "Remake", "PlayStation"],
    publisher: "PLAYSTATION STUDIOS",
  }),
  catalogGame({
    id: "catalog-dark-souls-3",
    title: "Dark Souls III",
    slug: "dark-souls-3",
    description: `RPG de ação da FromSoftware com mundos interconectados, chefes memoráveis e combate desafiador.

A Era do Fogo está se apagando pela última vez, e Lothric, reino decadente, reúne ecos de áreas e personagens de toda a trilogia Souls em uma última tentativa de vincular a Primeira Chama, encerrando a saga com tom apocalíptico e melancólico.

O combate acelera o ritmo em relação aos jogos anteriores, com inimigos mais agressivos e uma maior ênfase em posicionamento e timing, enquanto artes de combate exclusivas de cada arma adicionam variação tática a duelos contra cavaleiros corrompidos e chefes titânicos.

Como conclusão da trilogia dirigida por Hidetaka Miyazaki, o jogo recebeu as expansões Ashes of Ariandel e The Ringed City, fechando o ciclo Souls com uma direção de arte gótica que se tornou referência do gênero.`,
    price: 299.9,
    releaseDate: "2016-04-12",
    categories: ["Ação", "RPG", "Fantasia"],
    tags: ["Soulslike", "FromSoftware", "Fantasia Sombria"],
    publisher: "BANDAI NAMCO",
  }),
  catalogGame({
    id: "catalog-god-of-war",
    title: "God of War",
    slug: "god-of-war",
    description: `Kratos deixa para trás seu passado grego para viver na Midgard nórdica ao lado do filho Atreus, em uma jornada de redenção pelos Nove Reinos.

Após a morte da esposa, Kratos precisa ensinar o filho Atreus a sobreviver em um mundo nórdico hostil, cumprindo o último pedido dela: espalhar suas cinzas do ponto mais alto dos Nove Reinos. A viagem se torna também uma reconciliação de Kratos com seu passado violento como o antigo Deus da Guerra grego.

A câmera contínua sem cortes, inédita na série, aproxima o jogador da relação entre pai e filho, enquanto o Machado Leviatã substitui as Lâminas do Caos como arma principal, permitindo arremessos, recall mágico e combos que combinam força bruta com as flechas de Atreus.

Sob direção de Cory Barlog, a reinvenção de 2018 na Santa Monica Studio é considerada um divisor de águas para a franquia, elevando a narrativa e a atuação de Christopher Judge como Kratos a um novo patamar.`,
    price: 199.9,
    releaseDate: "2018-04-20",
    categories: ["Ação", "Aventura", "Hack and Slash"],
    tags: ["Kratos", "Mitologia Nórdica", "Santa Monica Studio", "Narrativa"],
    publisher: "SANTA MONICA STUDIO",
  }),
  catalogGame({
    id: "catalog-gang-beasts",
    title: "Gang Beasts",
    slug: "gang-beasts",
    description: `Brawler multiplayer com físicas exageradas: personagens gelatinosos se enfrentam em arenas caóticas cheias de armadilhas.

Sem golpes especiais ou combos complexos, as lutas dependem inteiramente da física: agarrar, empurrar e arremessar oponentes para fora de arenas repletas de armadilhas, como esteiras industriais, penhascos e veículos em movimento, gerando situações cômicas e imprevisíveis.

Pensado sobretudo para partidas locais, o jogo brilha em modos de até oito jogadores simultâneos, favorecendo o caos social entre amigos mais do que a competição equilibrada, com personalização simples de personagens gelatinosos.

Desenvolvido pela pequena Boneless Metal, o jogo se tornou um fenômeno de vídeos e streams justamente pela imprevisibilidade de sua física, consolidando-se como clássico de festa mesmo anos após o lançamento.`,
    price: 49.9,
    releaseDate: "2017-12-05",
    categories: ["Ação", "Festa", "Multijogador"],
    tags: ["Indie", "Local Co-op", "Física", "Party Game"],
    publisher: "BONELESS METAL",
  }),
  catalogGame({
    id: "catalog-mgs-delta",
    title: "Metal Gear Solid Delta: Snake Eater",
    slug: "metal-gear-solid-delta",
    description: `Remake completo do clássico de furtividade na selva. Naked Snake enfrenta uma missão em solo soviético que mudará a história para sempre.

Ambientado em 1964, no auge da Guerra Fria, Naked Snake se infiltra na selva soviética para resgatar um cientista e deter uma ameaça nuclear, enfrentando sua mentora The Boss em um confronto que redefine os conceitos de lealdade, patriotismo e sacrifício na franquia.

O remake preserva os sistemas de camuflagem, cura de ferimentos e sobrevivência na selva que definiram o jogo original, como caçar e preparar alimentos, agora com controles modernizados e a opção de alternar entre uma câmera clássica fixa e uma nova câmera livre em terceira pessoa.

Produzido pela Konami com direção de arte que recria fielmente a visão de Hideo Kojima para o título original de 2004, o remake é tratado como uma reconstrução respeitosa de um dos pilares narrativos dos jogos de furtividade.`,
    price: 349.9,
    releaseDate: "2025-08-28",
    categories: ["Ação", "Aventura", "Furtividade"],
    tags: ["Stealth", "Konami", "Remake", "PS5"],
    publisher: "KONAMI",
  }),
  catalogGame({
    id: "catalog-days-gone-remake",
    title: "Days Gone Remake",
    slug: "days-gone-remake",
    description: `Como o caçador de recompensas Deacon St. John, sobreviva em um mundo aberto pós-apocalíptico dominado por hordas de Freakers.

Dois anos após um surto global transformar parte da população em Freakers, Deacon busca respostas sobre o paradeiro de sua esposa Sarah enquanto navega por facções de sobreviventes, cada uma com sua própria visão sobre como reconstruir a sociedade em meio ao colapso.

A moto de Deacon funciona como extensão do personagem, exigindo manutenção de combustível e reparos constantes durante travessias por um mapa aberto hostil, enquanto hordas massivas de Freakers, compostas por centenas de inimigos simultâneos, representam alguns dos momentos mais intensos do jogo.

A remasterização pela Bend Studio aprimora iluminação, texturas e desempenho técnico, revisitando um título que, apesar de recepção dividida no lançamento original, conquistou uma base de fãs fiel ao longo dos anos.`,
    price: 249.9,
    releaseDate: "2026-03-01",
    categories: ["Ação", "Aventura", "Sobrevivência", "Mundo Aberto"],
    tags: ["Zumbis", "Mundo Aberto", "Bend Studio", "Moto"],
    publisher: "BEND STUDIO",
  }),
  catalogGame({
    id: "catalog-god-of-war-3-remastered",
    title: "God of War III Remastered",
    slug: "god-of-war-3-remastered",
    description: `A batalha final de Kratos contra o Monte Olimpo, remasterizada em alta definição com desempenho aprimorado.

Traído pelos deuses do Olimpo, Kratos escala o Monte Olimpo para se vingar de Zeus, deixando um rastro de destruição mitológica que encerra a trilogia grega original com o tom mais brutal e espetacular da série.

Combos viscerais com as Lâminas do Caos, quebra-cabeças ambientais em escala monumental e finalizações cinematográficas contra titãs e deuses definem um ritmo de ação quase ininterrupto, culminando em algumas das sequências de chefe mais lembradas da geração PlayStation 3.

A versão remasterizada pela Santa Monica Studio traz resolução em alta definição e taxa de quadros aprimorada, preservando a direção original de Stig Asmussen para uma nova geração de jogadores.`,
    price: 129.9,
    releaseDate: "2015-07-14",
    categories: ["Ação", "Aventura", "Hack and Slash"],
    tags: ["Kratos", "Mitologia Grega", "Santa Monica Studio", "Remasterizado"],
    publisher: "SANTA MONICA STUDIO",
  }),
  catalogGame({
    id: "catalog-battlefield-6",
    title: "Battlefield 6",
    slug: "battlefield-6",
    description: `Combate militar em larga escala com destruição total de cenários, veículos e batalhas multiplayer de até 128 jogadores.

O motor de destruição permite derrubar estruturas inteiras em tempo real, alterando linhas de visão e rotas de combate no meio de um confronto, enquanto classes especializadas em assalto, suporte, engenharia e reconhecimento incentivam trabalho em equipe organizado.

Tanques, helicópteros e veículos blindados operam ao lado da infantaria em mapas amplos, sustentando batalhas de até 128 jogadores em modos como Conquista e Breakthrough, marca registrada da série desde seus primeiros títulos.

Desenvolvido pela EA DICE, o jogo busca retomar a identidade de combate em larga escala e destruição ambiental que consagrou a franquia, após entradas anteriores marcadas por recepção mais morna do público.`,
    price: 299.9,
    releaseDate: "2025-10-10",
    categories: ["Ação", "FPS", "Multijogador"],
    tags: ["Guerra", "Multiplayer", "EA DICE", "Destruição"],
    publisher: "ELECTRONIC ARTS",
  }),
  catalogGame({
    id: "catalog-doom-dark-ages",
    title: "DOOM: The Dark Ages",
    slug: "doom-the-dark-ages",
    description: `Prequência sombria e medieval da saga DOOM. Empunhe escudo-serra e maça enquanto o Doom Slayer massacra hordas infernais.

Ambientado antes dos eventos de DOOM (2016), o jogo explora as origens do Doom Slayer como uma arma forjada por deuses para conter as hordas infernais, em um cenário que mistura fantasia medieval sombria com tecnologia demoníaca grotesca.

Além do combate frenético característico da série, o Slayer ganha um escudo-serra para ataques à distância e bloqueios, uma maça capaz de esmagar formações inteiras de inimigos e sequências em um dragão mecânico e um mech gigante, expandindo a escala das batalhas.

Desenvolvido pela id Software, o jogo mantém a direção de arte brutal da franquia enquanto experimenta um ritmo de combate mais posicional, complementando a velocidade extrema de DOOM Eternal com confrontos de maior escala.`,
    price: 299.9,
    releaseDate: "2025-05-15",
    categories: ["Ação", "FPS"],
    tags: ["Doom Slayer", "id Software", "Demônios", "Medieval"],
    publisher: "BETHESDA SOFTWORKS",
  }),
  catalogGame({
    id: "catalog-demon-slayer-hinokami",
    title: "Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles",
    slug: "demon-slayer-hinokami-chronicles",
    description: `Reviva a jornada de Tanjiro Kamado em batalhas de arena fiéis ao anime, com técnicas de respiração espetaculares.

O jogo recria os principais arcos do anime, desde a tragédia que transforma Nezuko em demônio até a formação de Tanjiro como Caçador de Demônios, narrando eventos por meio de cutscenes fiéis à animação original.

As batalhas em arena usam as Respirações elementais — Água, Trovão, Chama e outras — para combos vistosos e habilidades especiais que recriam ataques icônicos do anime, com um sistema de esquiva e contra-ataque que recompensa leitura de padrões inimigos.

Desenvolvido pela CyberConnect2, estúdio conhecido por adaptações de anime como Naruto: Ultimate Ninja Storm, o jogo aposta em efeitos visuais vibrantes que buscam reproduzir a estética marcante da animação de Demon Slayer.`,
    price: 249.9,
    releaseDate: "2021-10-14",
    categories: ["Ação", "Luta"],
    tags: ["Anime", "Arena Fighter", "Demon Slayer", "CyberConnect2"],
    publisher: "SEGA",
  }),
  catalogGame({
    id: "catalog-genshin-impact",
    title: "Genshin Impact",
    slug: "genshin-impact",
    description: `Embarque em uma jornada por Teyvat, um vasto mundo fantástico repleto de sete nações regidas por diferentes elementos e divindades, em busca de um irmão ou irmã perdido logo na chegada.

Como o Viajante, você atravessa terras inspiradas em culturas do mundo real, cada uma moldada por um elemento específico e um Arconte que a governa, encontrando companheiros com histórias e motivações próprias ao longo do caminho. A narrativa se expande continuamente por meio de atualizações que introduzem novas regiões, arcos e revelações sobre o destino dos dois irmãos.

A exploração é livre e vertical, com escalada sem limite de estamina reduzida, planador para atravessar grandes distâncias e quebra-cabeças ambientais que usam os sete elementos — Piro, Hidro, Eletro, Crio, Anemo, Geo e Dendro — cujas combinações geram reações como Vaporizar ou Sobrecarregar, tanto na exploração quanto no combate em tempo real com equipes de até quatro personagens.

Desenvolvido pela HoYoverse, o jogo é gratuito e monetizado por meio de um sistema de invocação (gacha) para obter novos personagens e armas, sustentando uma das maiores bases de jogadores do mundo com atualizações regulares, trilha sonora orquestral aclamada e eventos sazonais robustos.`,
    price: 0,
    releaseDate: "2020-09-28",
    categories: ["RPG", "Ação", "Aventura", "Mundo Aberto"],
    tags: ["Gacha", "Anime", "Free to Play", "Multiplayer", "Mundo Aberto"],
    publisher: "HOYOVERSE",
  }),
  catalogGame({
    id: "catalog-valorant",
    title: "Valorant",
    slug: "valorant",
    description: `Shooter tático 5v5 gratuito onde precisão de mira encontra um elenco de agentes com habilidades únicas, plantando ou defusando o Spike em rodadas de alta tensão.

Cada agente pertence a um dos quatro papéis táticos — Duelista, Iniciador, Controlador ou Sentinela — e carrega um conjunto de habilidades que abrem espaço, revelam inimigos ou negam território, complementando o tiroteio direto sem substituir a importância da mira fina e do posicionamento.

A economia de compra por rodada obriga cada equipe a gerenciar créditos entre armas, escudos e habilidades, criando decisões estratégicas constantes sobre quando forçar uma compra completa ou economizar para a próxima rodada, enquanto mapas desenhados com ângulos de tiro justos recompensam leitura de jogo e comunicação em equipe.

Desenvolvido pela Riot Games, o título se tornou rapidamente um pilar do cenário competitivo global através do circuito VCT, recebendo novos agentes, mapas e temporadas de passe de batalha em um ciclo constante de conteúdo gratuito.`,
    price: 0,
    releaseDate: "2020-06-02",
    categories: ["Ação", "FPS", "Multijogador"],
    tags: ["Hero Shooter", "Tático", "Esports", "Free to Play"],
    publisher: "RIOT GAMES",
  }),
  catalogGame({
    id: "catalog-resident-evil-requiem",
    title: "Resident Evil Requiem",
    slug: "resident-evil-requiem",
    description: `Grace Ashcroft, agente em treinamento do FBI, é convocada a investigar um hospital abandonado em Raccoon City com ligações diretas ao passado obscuro de sua própria mãe.

A trama aprofunda os traumas pessoais da protagonista enquanto ela se depara com experimentos esquecidos e horrores que ecoam a história da cidade destruída pelo vírus-T, tecendo um mistério psicológico tão perturbador quanto as ameaças físicas que rondam os corredores decadentes do hospital.

O jogo alterna entre perspectivas de primeira e terceira pessoa, permitindo ao jogador escolher a abordagem que preferir para explorar ambientes claustrofóbicos, gerenciar recursos escassos e evitar criaturas mutantes através de furtividade cuidadosa, mantendo o equilíbrio entre tensão constante e combate calculado que define a série moderna.

Desenvolvido pela Capcom no RE Engine, o título dá continuidade ao renascimento crítico da franquia iniciado com Resident Evil Village, prometendo elevar ainda mais o nível de terror psicológico e imersão visual da saga.`,
    price: 349.9,
    releaseDate: "2026-02-27",
    categories: ["Ação", "Aventura", "Furtividade", "Terror"],
    tags: ["Survival Horror", "Capcom", "Terror", "Single Player"],
    publisher: "CAPCOM",
  }),
  catalogGame({
    id: "catalog-arc-raiders",
    title: "ARC Raiders",
    slug: "arc-raiders",
    description: `Em uma Terra devastada por uma invasão de máquinas conhecidas como ARC, pequenos grupos de sobreviventes se arriscam em incursões cooperativas para recuperar recursos essenciais à humanidade.

Cada expedição parte de um refúgio subterrâneo rumo a zonas de superfície contestadas, onde equipamento, munição e tecnologia recuperada podem ser extraídos com sucesso ou perdidos para sempre caso o raider caia em combate, elevando o peso de cada decisão tomada em campo.

Além das temíveis máquinas ARC, que variam de drones ágeis a colossos blindados, outros esquadrões de jogadores disputam os mesmos recursos, criando confrontos tensos de PvPvE onde negociar, emboscar ou simplesmente fugir são estratégias igualmente válidas, enquanto o progresso entre incursões permite craftar e aprimorar equipamentos no refúgio.

Desenvolvido pela Embark Studios, formado por veteranos da série Battlefield, o jogo adotou o modelo free-to-play para ampliar seu alcance, entregando um shooter de extração tecnicamente refinado que rapidamente conquistou uma comunidade fiel.`,
    price: 249.9,
    releaseDate: "2025-10-30",
    categories: ["Ação", "FPS", "Sobrevivência", "Multijogador"],
    tags: ["Extraction Shooter", "PvPvE", "Co-op", "Ficção Científica"],
    publisher: "EMBARK STUDIOS",
  }),
  catalogGame({
    id: "catalog-marvel-tokon",
    title: "Marvel Tokon: Fighting Souls",
    slug: "marvel-tokon-fighting-souls",
    description: `Reúna um elenco lendário de heróis e vilões da Marvel em duelos 1 contra 1 onde almas e poderes cósmicos colidem em arenas totalmente destrutíveis.

O conceito de "Tokon", um choque decisivo de almas e vontades, dá nome ao sistema de combate: cada personagem carrega um kit de golpes fiel à sua identidade nos quadrinhos, de combos aéreos ágeis a investidas de força bruta, culminando em habilidades especiais carregadas de energia que podem virar o rumo de uma luta em segundos.

O elenco reúne ícones como Homem-Aranha, Tempestade, Feiticeira Escarlate e Magik, cada um com animações e efeitos visuais que recriam a estética vibrante dos quadrinhos em cenários tridimensionais reativos, enquanto modos de equipe expandem os duelos individuais para confrontos em grupo.

Produzido em parceria com a Marvel Games, o título busca reacender o gênero de jogos de luta licenciados com ambições competitivas, unindo fidelidade visual ao material de origem e um sistema de combate pensado tanto para iniciantes quanto para jogadores competitivos.`,
    price: 249.9,
    releaseDate: "",
    categories: ["Ação", "Luta"],
    tags: ["Marvel", "Arena Fighter", "Anime Style", "Multiplayer"],
    publisher: "MARVEL GAMES",
  }),
  catalogGame({
    id: "catalog-spider-man-2",
    title: "Marvel's Spider-Man 2",
    slug: "spider-man-2",
    description: `Peter Parker e Miles Morales unem forças como o Homem-Aranha para proteger Nova York quando os Caçadores de Kraven invadem a cidade e o simbionte Venom começa a se manifestar.

A dupla de protagonistas jogáveis permite alternar livremente entre Peter e Miles em missões paralelas que se entrelaçam, aprofundando o crescimento pessoal de cada herói enquanto Kraven caça os predadores mais perigosos do mundo e uma ameaça simbiótica cresce nas sombras da cidade.

O mundo aberto se expande para além de Manhattan, incluindo Brooklyn e Queens, atravessado por um sistema de web-wing que combina balanço de teia com voo planado para uma locomoção ainda mais fluida, enquanto o combate ganha novas camadas com os poderes simbiontes de Peter e as habilidades bioelétricas de Miles.

Desenvolvido pela Insomniac Games, o jogo eleva o padrão técnico estabelecido pelos títulos anteriores no PlayStation 5, sendo aclamado pela narrativa emocional, pela fluidez de traversal e pela ambição de contar duas histórias de heróis com pesos dramáticos equivalentes.`,
    price: 299.9,
    releaseDate: "2023-10-20",
    categories: ["Ação", "Aventura", "Mundo Aberto"],
    tags: ["Marvel", "Super-Herói", "PlayStation", "Insomniac Games"],
    publisher: "INSOMNIAC GAMES",
  }),
  catalogGame({
    id: "catalog-roblox",
    title: "Roblox",
    slug: "roblox",
    description: `Plataforma de jogos gerados por usuários onde milhões de experiências criadas pela própria comunidade convivem em um único hub, de simuladores casuais a RPGs ambiciosos.

Qualquer jogador pode criar e publicar suas próprias experiências usando o Roblox Studio, uma ferramenta de desenvolvimento acessível que ensina lógica de programação e design de jogos, transformando criadores amadores em desenvolvedores independentes com alcance global.

A economia virtual gira em torno dos Robux, moeda usada para personalizar avatares, adquirir itens dentro das experiências e apoiar criadores, enquanto o suporte multiplataforma entre PC, celular, tablet e console mantém milhões de jogadores conectados simultaneamente em salas sociais.

Mantido pela Roblox Corporation, o jogo se tornou um fenômeno cultural especialmente entre o público mais jovem, expandindo-se com eventos ao vivo, colaborações com marcas e franquias, e ambições declaradas de se tornar uma plataforma social e criativa duradoura.`,
    price: 0,
    releaseDate: "2006-09-01",
    categories: ["Sandbox", "Aventura", "Multijogador"],
    tags: ["UGC", "Free to Play", "Multiplayer", "Criativo"],
    publisher: "ROBLOX CORPORATION",
  }),
  catalogGame({
    id: "catalog-free-fire",
    title: "Free Fire",
    slug: "free-fire",
    description: `Battle royale mobile onde 50 jogadores saltam de paraquedas em uma ilha isolada e apenas um esquadrão sobrevive ao confronto final contra a zona segura que se fecha implacavelmente.

Pensadas para durar cerca de dez minutos, as partidas priorizam ritmo acelerado e decisões rápidas, com um arsenal variado de armas, veículos terrestres e aquáticos, e uma zona segura que empurra os sobreviventes para confrontos cada vez mais próximos conforme a partida avança.

Personagens jogáveis carregam habilidades especiais passivas ou ativáveis que se combinam ao arsenal tradicional, permitindo estratégias de equipe que vão além da pontaria, enquanto sistemas de clã e temporadas ranqueadas mantêm a comunidade engajada partida após partida.

Publicado pela Garena, subsidiária da Sea Limited, o jogo se tornou um dos títulos mobile mais jogados do mundo, com destaque especial no Brasil, Sudeste Asiático e América Latina, sustentando um cenário competitivo robusto através do Free Fire World Series.`,
    price: 0,
    releaseDate: "2017-12-04",
    categories: ["Ação", "Sobrevivência", "Multijogador", "Battle Royale"],
    tags: ["Battle Royale", "Mobile", "Free to Play", "Garena"],
    publisher: "GARENA",
  }),
  catalogGame({
    id: "catalog-league-of-legends",
    title: "League of Legends",
    slug: "league-of-legends",
    description: `MOBA 5v5 gratuito disputado no Summoner's Rift, onde duas equipes de invocadores comandam campeões com habilidades únicas em busca de destruir o Nexus adversário.

O extenso elenco de campeões cobre praticamente todo tipo de arquétipo de fantasia, cada um com quatro habilidades ativas e uma ultimate que definem seu papel em campo, sustentando uma fase de seleção estratégica onde composições de equipe e contrapicks moldam o resultado antes mesmo da partida começar.

As funções tradicionais — Topo, Selva, Meio, Atirador e Suporte — organizam o time em torno de rotas e objetivos, enquanto dragões, arauto e o poderoso Barão Nashor concedem vantagens coletivas que transformam o controle de mapa em uma camada estratégica tão importante quanto os combates diretos entre campeões.

Desenvolvido pela Riot Games, o jogo se consolidou como um dos esportes eletrônicos mais assistidos do planeta através do Campeonato Mundial, sustentando um ciclo constante de balanceamento, novos campeões e expansões de universo, incluindo a aclamada série animada Arcane.`,
    price: 0,
    releaseDate: "2009-10-27",
    categories: ["Ação", "MOBA", "Multijogador"],
    tags: ["MOBA", "Esports", "Free to Play", "Riot Games"],
    publisher: "RIOT GAMES",
  }),
  catalogGame({
    id: "catalog-marvels-wolverine",
    title: "Marvel's Wolverine",
    slug: "marvels-wolverine",
    description: `Logan enfrenta seu passado violento como o mutante conhecido como Wolverine, em uma aventura sombria e madura ambientada no universo Marvel.

Distante da luz dos Vingadores, Logan é arrastado a um conflito que envolve a Alkali Corporation e o Clã Yakuza, revivendo fragmentos dolorosos de seu passado como arma viva mutante enquanto tenta encontrar um propósito além da violência que definiu boa parte de sua existência.

O combate corpo a corpo prioriza as garras de adamantium e o fator de cura regenerativo, permitindo embates brutais e desmembramentos que refletem a fama do anti-herói nos quadrinhos, além de habilidades sensoriais aguçadas para rastrear inimigos e itens em ambientes semiabertos.

Desenvolvido pela Insomniac Games, mesmo estúdio por trás de Marvel's Spider-Man, o jogo promete uma classificação indicativa mais madura que os títulos anteriores do estúdio, aprofundando o tom violento e psicológico do personagem enquanto expande o universo compartilhado da PlayStation Studios.`,
    price: 0,
    releaseDate: "",
    categories: ["Ação", "Aventura", "Mundo Aberto"],
    tags: ["Marvel", "X-Men", "Insomniac Games", "PlayStation"],
    publisher: "INSOMNIAC GAMES",
  }),
  catalogGame({
    id: "catalog-fortnite",
    title: "Fortnite",
    slug: "fortnite",
    description: `Cem jogadores saltam de um ônibus voador sobre uma ilha em constante mutação, construindo estruturas e lutando até restar apenas um sobrevivente ou esquadrão.

A ilha se reinventa a cada temporada através de eventos ao vivo que mudam o mapa, introduzem novos pontos de interesse e cruzam o battle royale com narrativas de crossovers que já reuniram desde super-heróis Marvel até artistas musicais em shows dentro do próprio jogo.

O sistema de construção em tempo real, que permite erguer paredes, rampas e torres instantaneamente com recursos coletados, diferencia o combate de outros battle royales, exigindo tanto mira precisa quanto raciocínio espacial rápido sob pressão, enquanto a zona de tempestade força confrontos cada vez mais próximos.

Desenvolvido pela Epic Games, o título se tornou um fenômeno cultural global, sustentado por um modelo free-to-play com cosméticos e um passe de batalha sazonal, e expandiu-se para modos como Fortnite Festival e LEGO Fortnite, consolidando-se como uma das plataformas de entretenimento mais lucrativas já criadas.`,
    price: 0,
    releaseDate: "2017-07-25",
    categories: ["Ação", "Battle Royale", "Multijogador"],
    tags: ["Battle Royale", "Free to Play", "Epic Games", "Construção"],
    publisher: "EPIC GAMES",
  }),
  catalogGame({
    id: "catalog-apex-legends",
    title: "Apex Legends",
    slug: "apex-legends",
    description: `Vinte esquadrões de Lendárias com habilidades únicas disputam a sobrevivência nas arenas de Kings Canyon e outros mapas do universo Titanfall.

Ambientado décadas após os eventos de Titanfall, o jogo situa a competição dentro do Circuito Apex, um espetáculo televisionado onde soldados, cientistas e simulacros lutam por fama e fortuna, revelando aos poucos suas motivações através de trailers cinematográficos e eventos sazonais.

Cada Lendária carrega três habilidades exclusivas — tática, passiva e definitiva — que se combinam em sinergias de equipe, enquanto o sistema de pingar sem voz permite comunicação tática rápida, e mecânicas de movimento herdadas de Titanfall, como escalada e deslizamento, mantêm o ritmo de combate extremamente ágil.

Desenvolvido pela Respawn Entertainment e publicado pela Electronic Arts, o jogo se consolidou como um dos principais nomes do gênero battle royale, sustentando um cenário competitivo global através da Apex Legends Global Series e atualizações constantes de novas Lendárias, armas e mapas.`,
    price: 0,
    releaseDate: "2019-02-04",
    categories: ["Ação", "FPS", "Battle Royale", "Multijogador"],
    tags: [
      "Battle Royale",
      "Hero Shooter",
      "Free to Play",
      "Respawn Entertainment",
    ],
    publisher: "ELECTRONIC ARTS",
  }),
  catalogGame({
    id: "catalog-pubg",
    title: "PUBG: BATTLEGROUNDS",
    slug: "pubg",
    description: `Cem jogadores saltam de um avião sobre ilhas isoladas em busca de armas, veículos e equipamentos, enquanto uma zona azul tóxica reduz o campo de batalha até restar um único sobrevivente.

Popularizando o formato battle royale em escala massiva, o jogo não possui uma narrativa tradicional, mas constrói tensão através da imprevisibilidade de cada partida, onde encontros com outros jogadores podem significar sobrevivência ou eliminação instantânea em qualquer um dos diversos mapas ambientados em diferentes regiões do mundo.

O looting realista, a balística de armas com queda de projétil e recuo pronunciado, e a necessidade de gerenciar veículos, coletes e curativos criam uma simulação de sobrevivência mais lenta e tática que rivais mais arcade, recompensando posicionamento cuidadoso e paciência acima de reflexos puros.

Desenvolvido pela Krafton, o jogo é creditado por popularizar o gênero battle royale para o mainstream, migrando para o modelo free-to-play em 2022 e mantendo um cenário competitivo ativo através da PUBG Global Championship, além de expansões de mapas e modos ao longo dos anos.`,
    price: 0,
    releaseDate: "2017-12-20",
    categories: ["Ação", "FPS", "Battle Royale", "Multijogador"],
    tags: ["Battle Royale", "Krafton", "Tático", "Multiplayer"],
    publisher: "KRAFTON",
  }),
  catalogGame({
    id: "catalog-tlou-part-1",
    title: "The Last of Us Part I",
    slug: "the-last-of-us-part-1",
    description: `Joel Miller é contratado para escoltar Ellie, uma garota de 14 anos possivelmente imune à infecção fúngica que devastou a civilização, através dos Estados Unidos pós-apocalípticos.

A jornada de Boston a outras regiões devastadas do país expõe Joel e Ellie a facções humanas tão perigosas quanto os infectados, enquanto o vínculo entre os dois se aprofunda diante de perdas e decisões morais que culminam em um dos finais mais discutidos da história dos games.

O combate mistura furtividade, crafting de itens escassos e confrontos táticos contra clickers e outros infectados, exigindo gerenciamento cuidadoso de munição e recursos, enquanto a IA de Ellie e outros aliados reage dinamicamente às ações do jogador durante emboscadas e fugas.

Refeito pela Naughty Dog para PlayStation 5, o remake reconstrói integralmente gráficos, animações faciais e sistemas de jogo baseados em Part II, sendo aclamado por elevar tecnicamente um dos títulos mais premiados da geração PlayStation 4 sem alterar sua narrativa original.`,
    price: 299.9,
    releaseDate: "2022-09-02",
    categories: ["Ação", "Aventura", "Sobrevivência", "Terror"],
    tags: ["Naughty Dog", "PlayStation", "Narrativa", "Pós-Apocalíptico"],
    publisher: "NAUGHTY DOG",
  }),
  catalogGame({
    id: "catalog-doki-doki-literature-club",
    title: "Doki Doki Literature Club!",
    slug: "doki-doki-literature-club",
    description: `Ao entrar no clube de literatura da escola a convite de uma amiga de infância, o jogador conhece quatro garotas com personalidades cativantes em uma aparente visual novel romântica.

Sob a fachada de poesia, festivais escolares e conversas descontraídas, a trama revela gradualmente camadas psicológicas perturbadoras, subvertendo as expectativas do gênero através de quebras de quarta parede e elementos de terror psicológico que impactam diretamente a experiência do jogador.

A escrita de poemas com escolha de palavras que refletem a afinidade com cada personagem é a principal mecânica de interação, enquanto o jogo manipula ativamente arquivos, interface e até mesmo a percepção de controle do jogador conforme a história avança para territórios mais sombrios.

Desenvolvido pela pequena Team Salvato e liderado por Dan Salvato, o jogo é distribuído gratuitamente desde o lançamento, com uma versão expandida paga chamada Plus, tornando-se um fenômeno de culto por subverter o gênero visual novel com uma narrativa que permanece um dos maiores exemplos de terror psicológico independente.`,
    price: 39.9,
    releaseDate: "2017-09-22",
    categories: ["Aventura", "Terror", "Simulação"],
    tags: ["Visual Novel", "Psicológico", "Indie"],
    publisher: "TEAM SALVATO",
  }),
  catalogGame({
    id: "catalog-horizon-forbidden-west",
    title: "Horizon Forbidden West",
    slug: "horizon-forbidden-west",
    description: `Aloy parte rumo ao Oeste Proibido, uma terra selvagem repleta de máquinas ainda mais perigosas, em busca de respostas para uma praga misteriosa que ameaça toda a vida na Terra.

A expedição revela mais sobre o colapso da civilização antiga que originou as máquinas, enquanto Aloy enfrenta tribos rivais, conspirações políticas e uma ameaça tecnológica que ultrapassa até mesmo o conhecimento acumulado desde os eventos do primeiro jogo.

Novas armas, habilidades de escalada mais livres e a capacidade de planar e nadar em profundidades submersas expandem o combate tático contra máquinas, que agora contam com comportamentos em manada e novas fraquezas elementais para explorar através de armadilhas e componentes recuperados de suas partes mecânicas.

Desenvolvido pela Guerrilla Games, o jogo expande a escala visual e narrativa do universo criado em Horizon Zero Dawn, sendo aclamado pela direção de arte vibrante, pela evolução do combate contra máquinas e pela atuação de Ashly Burch como Aloy, consolidando a franquia como um dos pilares exclusivos da PlayStation.`,
    price: 299.9,
    releaseDate: "2022-02-18",
    categories: ["Ação", "RPG", "Aventura", "Mundo Aberto"],
    tags: ["Aloy", "PlayStation", "Guerrilla Games", "Ficção Científica"],
    publisher: "GUERRILLA GAMES",
  }),
  catalogGame({
    id: "catalog-kandidatos",
    title: "Kandidatos",
    slug: "kandidatos",
    description: `Em meio a uma disputa eleitoral caricata, Kandidatos transforma a corrida presidencial brasileira em um verdadeiro ringue de boxe, onde carisma, deboche e golpes exagerados decidem quem vence cada round.

O elenco reúne caricaturas afiadas de figuras públicas e políticos que dominaram o noticiário nacional nos últimos anos, cada uma com trejeitos, frases de efeito e bordões reconhecíveis transformados em golpes de combate, misturando humor ácido com uma estética escrachada tipicamente brasileira.

As partidas acontecem em confrontos 1 contra 1 organizados em rounds dentro do ringue, com golpes e combos simples de aprender, mas que recompensam timing e leitura do adversário, favorecendo disputas rápidas e resenhas entre amigos mais do que a profundidade técnica de um jogo de luta tradicional.

Desenvolvido pelo estúdio independente brasileiro Guaru Games sob a chancela BR, Kandidatos integra uma cena crescente de jogos de humor e sátira nacional, usando o absurdo da política brasileira como matéria-prima para o entretenimento.`,
    price: 0,
    releaseDate: "",
    categories: ["Ação", "Luta", "Festa"],
    tags: ["Indie", "Sátira", "Brasileiro", "Multijogador"],
    publisher: "GUARU GAMES",
  }),
  catalogGame({
    id: "catalog-persona-5-royal",
    title: "Persona 5 Royal",
    slug: "persona-5-royal",
    description: `Um estudante transferido para Tóquio após ser injustamente condenado assume a identidade de Joker e desperta o poder de invocar Personas, dando início a uma dupla vida entre os estudos no colégio Shujin e as incursões dos Ladrões Fantasmas de Coração.

Ao lado de um elenco de aliados que também descobrem seus próprios Personas, o protagonista invade Palácios distorcidos criados pela cognição de adultos corruptos, roubando seus "Tesouros" para forçar mudanças de coração e expor abusos de poder escondidos por trás da fachada da sociedade japonesa.

O combate por turnos explora fraquezas elementais dos inimigos para encadear ataques All-Out, enquanto o cotidiano fora das masmorras é gerido em um calendário detalhado de relacionamentos (Confidants), estudos e atividades noturnas que fortalecem tanto as habilidades sociais quanto o poder das Personas do protagonista.

Esta versão Royal, desenvolvida pela P-Studio e publicada pela Atlus, expande o Persona 5 original com um semestre inteiro adicional, a personagem Kasumi/Violet, o Palácio de Sae Niijima remodelado, a área social Thieves Den e o professor Takuto Maruki, sendo amplamente considerada a versão definitiva da aclamada aventura urbana da série Persona.`,
    price: 299.9,
    releaseDate: "2019-10-31",
    categories: ["RPG", "Aventura", "Turnos"],
    tags: ["JRPG", "Anime", "Atlus", "Narrativa"],
    publisher: "ATLUS",
  }),
];
