import gondImg from '../assets/gond_community.jpg';
import gondDanceImg from '../assets/Gussadi_Dance_Of_Gond_Tribals.jpg';
import gondMapImg from '../assets/Gondi_tribe_percent_by_districts_2011_census.png';
import gondSong from '../assets/gond_community.mp3';
import garoImg from '../assets/garo_tribe.jpg';
import garoDanceImg from '../assets/garo_dance.jpg';
import garoSong from '../assets/daro_song.mp3';
import warliSong from '../assets/the_warli_tribe_song.mp3';
import warliImg1 from '../assets/warilitribe1.jpeg';
import warliImg2 from '../assets/warlitribe2.jpeg';
export interface BioKnowledge {
    id: string;
    title: string;
    summary: string;
    fullDescription: string;
    riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
    licenseType: 'COMMUNITY_CONSENT' | 'RESEARCH_ONLY' | 'COMMERCIAL';
    attribution: string;
    // Enhanced Phase 3 Fields
    region?: string;
    location?: string; // GPS Coordinates
    category?: 'MEDICINAL' | 'AGRICULTURAL' | 'ECOLOGICAL' | 'RITUAL';
    preparationProcess?: string; // Hidden behind license
    usageContext?: string; // Hidden behind license
    tribalMember?: string; // Submitting individual
    timestamp?: string;
    voiceNote?: string; // URL to recording
}

export interface MusicTrack {
    id: string;
    title: string;
    duration: string;
    audioFile: string;
    licenseType: string;
    attribution: string;
    // Enhanced Phase 3 Fields
    performanceContext?: 'FESTIVAL' | 'RITUAL' | 'AGRICULTURAL' | 'CELEBRATION';
    lyrics?: string;
    instrumentation?: string;
    culturalMeaning?: string;
    videoFile?: string; // Optional video
    location?: string;
    tribalMember?: string;
    timestamp?: string;
    fingerprint?: string; // Audio hash
}

export interface MediaItem {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    url?: string;
}

export interface Community {
    id: string;
    name: string;
    region: string;
    culturalIdentity: string;
    description: string;
    image: string;
    coverImage?: string;
    gallery?: string[];
    bioKnowledge: BioKnowledge[];
    music: MusicTrack[];
    videos: MediaItem[];
}

export const mockCommunities: Community[] = [
    {
        id: 'warli',
        name: 'Warli Tribe',
        region: 'Maharashtra & Gujarat',
        culturalIdentity: 'An indigenous Adivasi community renowned for their distinct, monosyllabic wall paintings.',
        description: `The Warli or Varli are an indigenous tribe (Adivasi) of western India, living in mountainous as well as coastal areas along the Maharashtra-Gujarat border. They have their own animistic beliefs, life, customs and traditions, and speak the unwritten Varli language which belongs to the southern zone of the Indo-Aryan languages.\n\nHistory & Colonial Era: Originally inhabiting the forests and hilly terrains, they were the primary owners of all land in the Palghar district until the 1870s. The 1870s marked a turning point as British administration allowed outsiders to systematically seize their lands, forcing the Warli into exploitative Begar and Sharecropping systems.\n\nThe Warli Revolt (1945–1947): Driven by abysmal living conditions, the Warli organized a powerful, peaceful resistance led by activists Shamrao and Godavari Parulekar. Despite extreme police violence and casualties, their persistence led to the abolition of the begar system.\n\nDemographics & Culture: The Warli were traditionally semi-nomadic but have transitioned mainly into agriculturists cultivating rice and wheat. Their extremely rudimentary wall paintings use a very basic graphic vocabulary: a circle (representing the sun and moon), a triangle (derived from mountains and trees), and a square (indicating a sacred enclosure or "chauk").\n\nWarli Art Tradition: Inside a Devchauk, we find Palaghata, the mother goddess, symbolizing fertility. The ritual paintings are done only for special occasions such as weddings or harvests using a white pigment (rice paste and water) against a red ochre background of branches, earth, and cow dung.`,
        image: warliImg1,
        coverImage: warliImg2,
        gallery: [warliImg1, warliImg2],
        bioKnowledge: [
            {
                id: 'bk-warli1',
                title: 'Warli Ritual Art Pigments',
                summary: 'Traditional crafting of the white pigment from rice paste & water with gum.',
                fullDescription: 'Knowledge outlining the exact preparation process of the ritual "chauk" squares, fertility mother goddess variations, and the specific composition of red ochre backgrounds mixed from cow dung and local earth.',
                riskTier: 'MEDIUM',
                licenseType: 'COMMERCIAL',
                attribution: 'Preserved by the Warli Master Artists'
            }
        ],
        music: [
            {
                id: 'm-warli1',
                title: 'Warli Tribe Song',
                duration: '4:21',
                audioFile: warliSong,
                licenseType: 'COMMUNITY_CONSENT',
                attribution: 'Traditional Tarpa instrumental music associated with post-harvest dances.\nPreserved by the Warli Community.',
                performanceContext: 'FESTIVAL',
                culturalMeaning: 'Played using the Tarpa, a wind instrument, leading dancers into spiraling movements that mimic the circle of life.'
            }
        ],
        videos: [
            {
                id: 'v-warli1',
                title: 'Warli Art & Cultural Heritage',
                thumbnail: warliImg1,
                description: 'Explore the deep roots and meaning behind the iconic geometrical paintings.',
                url: 'https://www.youtube.com/embed/s3P3xME-CvI'
            },
            {
                id: 'v-warli2',
                title: 'Story of the Warli Revolt',
                thumbnail: warliImg2,
                description: 'A historical account of the 1945 resistance against colonial exploitation.',
                url: 'https://www.youtube.com/embed/wkYLM2JTDp8'
            },
            {
                id: 'v-warli3',
                title: 'Traditional Warli Lifestyle',
                thumbnail: warliImg1,
                description: 'Insights into their agricultural transition, daily life, and animistic beliefs.',
                url: 'https://www.youtube.com/embed/C-Mvr7rUWRo'
            }
        ]
    },
    {
        id: 'garo',
        name: 'Garo Tribe',
        region: 'Meghalaya',
        culturalIdentity: 'A matrilineal society deeply connected to nature and the Wangala harvest festival.',
        description: `The Garo community (A'chik or Mande) is a Tibeto-Burman ethnic group and one of the most prominent in Northeast India, primarily living in Meghalaya where they comprise about a third of the local population. They are globally recognized for maintaining one of the few remaining matrilineal societies where lineage and inheritance are traced through the mother.\n\nHistorical Origins: According to oral tradition, the Garo people first migrated to the Garo Hills from Tibet (referred to as Tibotgre) around 400 BC, under the leadership of Jappa Jalimpa, Sukpa, and Bongepa, crossing the Brahmaputra River. The earliest written records about the Garo date from around 1800, and were described by officials of the East India Company as fierce headhunters.\n\nEtymology: Historically, the name Garo was used for different peoples living on the southern bank of Brahmaputra River, but now refers primarily to those who call themselves A∙chik Mande (literally "hill people," from A∙chik "bite soil" and mande "people").\n\nSocial Structure: In this matrilineal system, children take their mother's clan name. Property is traditionally inherited by the youngest daughter (the Nokna), who cares for her parents. While the woman owns the property, the husband (Nokrom) manages it and the village headman (Nokma) holds political authority.\n\nGeographical Distribution: The Garo are mainly distributed over the Garo Hills, Khasi Hills, Ri-Bhoi districts in Meghalaya, as well as parts of Assam. In Bangladesh, lesser numbers are found in Mymensingh Division. A majority of Garo village or locality names end with -gre.\n\nReligion & Festivals: Today, most Garos in India follow Christianity with a few practicing the traditional Garo animist religion, Songsarek. The Songsarek includes deities who must be appeased with rituals to ensure the welfare of the tribe, with nature spirits like Misi Saljong, the Sun God of Fertility. The community's most important post-harvest festival is Wangala (the 100 Drums Festival).\n\nLifestyle & Traditions: The Garo people traditionally practice Jhum (shifting) cultivation. Their cultural dress includes the Dakmanda (colorful wrap-around skirt) for women, while food features staples flavored with Kalchi (burnt bamboo potash), dried fish (Nakam), and traditional rice beer (Minil Bichi).`,
        image: garoImg,
        coverImage: garoDanceImg,
        gallery: [garoDanceImg],
        bioKnowledge: [
            {
                id: 'bk-garo1',
                title: 'Jhum Cultivation Ecology',
                summary: 'Traditional shifting agriculture methods.',
                fullDescription: 'Knowledge associated with traditional slash-and-burn farming, specifically designed to adapt to the hilly terrains and ensure sustainable yield over cycles.',
                riskTier: 'MEDIUM',
                licenseType: 'RESEARCH_ONLY',
                attribution: 'Preserved by: Garo Community Council\nRecorded under: Cultural Governance Framework'
            }
        ],
        music: [
            {
                id: 'm-garo1',
                title: 'Pre-sowing Traditional Folk Song',
                duration: '0:00', // Update dynamically if duration is known
                audioFile: garoSong,
                licenseType: 'COMMUNITY_CONSENT',
                attribution: 'Traditional song invoking prayers to Misi Saljong (God of Harvest) for crop prosperity.\nPreserved by the Garo Community.',
                performanceContext: 'AGRICULTURAL',
                culturalMeaning: 'Sung at the house of the Nokma (Traditional Chief) to ensure a bountiful harvest.'
            }
        ],
        videos: [
            {
                id: 'v-garo1',
                title: 'Learn more about the Garo Tribe',
                thumbnail: garoImg,
                description: 'A documentary overview of the matrilineal Garo society, their traditions, and their deep connection to the hills of Meghalaya.',
                url: 'https://www.youtube.com/embed/uLbMIG6htoI'
            },
            {
                id: 'v-garo2',
                title: 'Wangala Dance Festival',
                thumbnail: garoDanceImg,
                description: 'The 100 Drums Wangala Festival, a thanksgiving ceremony for the Sun God of Fertility.',
                url: 'https://www.youtube.com/embed/35-EQbvVZCc'
            },
            {
                id: 'v-garo3',
                title: 'Traditional Garo Music & Culture',
                thumbnail: garoImg,
                description: 'Exploring the rich musical heritage and daily lifestyle of the Garo people.',
                url: 'https://www.youtube.com/embed/kdVDG5EZ4Xw'
            },
            {
                id: 'v-garo4',
                title: 'Garo Hills & Community Life',
                thumbnail: garoDanceImg,
                description: 'A closer look into the deeply rooted traditions and Jhum cultivation practices.',
                url: 'https://www.youtube.com/embed/wdA8SEaYOo8'
            }
        ]
    },

    {
        id: 'gond',
        name: 'Gond Community',
        region: 'Madhya Pradesh & Central India',
        culturalIdentity: 'An ethnolinguistic group known for intricate storytelling art, Deep nature connection, and the Koyapunem religion.',
        description: `The Gondi or Gond people are an ethnolinguistic group spread over the states of Madhya Pradesh, Maharashtra, Chhattisgarh, Uttar Pradesh, Telangana, Andhra Pradesh, Bihar, and Odisha. They are classified as a Scheduled Tribe and speak Gondi, a language belonging to the Dravidian family.\n\nHistorical Significance: The Gond formed many kingdoms of historical significance. Gondwana was the ruling kingdom in the Gondwana region of India between the 13th and 19th centuries CE. Well-known kingdoms include Chanda, Garha, and Deogarh. They are celebrated for their resistance, such as the Bastar rebellion of 1910 and the movements led by Komaram Bheem, who coined the slogan "jal, jangal, jameen" ("water, forest, land").\n\nSociety and Sagas: Gond society is divided into exogamous patrilineal units known as sagas. The clan (pari) is the main unit of organization. Group relations are carefully balanced, and many astronomical ideas served as the basis for their timekeeping.\n\nCulture & Art: The Gond people have a rich tradition of painting that illustrates their deep connection with nature, myths, and legends. In Adilabad, Diwali is celebrated with the traditional Gussadi dance, donning peacock-feathered turbans. They also have their own version of the Ramayana, known as the Gond Ramayani.\n\nReligion: While influenced by Hinduism, many practice their indigenous religion, Koyapunem. Their society reveres nature spirits and deities who must be appeased with rituals to ensure tribal welfare.`,
        image: gondImg,
        coverImage: gondDanceImg,
        gallery: [gondImg, gondDanceImg, gondMapImg],
        bioKnowledge: [
            {
                id: 'bk-g1',
                title: 'Forest Water Conservation Technique',
                summary: 'Methods for retaining water in dry areas.',
                fullDescription: 'Using specific rock formations and native plant root systems, this traditional ecological knowledge helps maintain soil moisture throughout the dry season.',
                riskTier: 'MEDIUM',
                licenseType: 'RESEARCH_ONLY',
                attribution: 'Preserved by: Gond Knowledge Keepers\nRecorded under: Cultural Governance Framework'
            }
        ],
        music: [
            {
                id: 'm-g1',
                title: 'Gussadi Dance Invocation',
                duration: '5:10',
                audioFile: gondSong,
                licenseType: 'COMMUNITY_CONSENT',
                attribution: 'Preserved by: Gond Ritual Musicians\nRecorded under: Cultural Governance Framework',
                performanceContext: 'FESTIVAL',
                culturalMeaning: 'Traditional rhythmic music accompanying the Gussadi dancers during the Diwali celebrations.'
            }
        ],
        videos: []
    }
];

// Flat arrays for marketplace
export const allMarketplaceAssets = mockCommunities.flatMap(c => {
    const assets: any[] = [];
    c.bioKnowledge.forEach(bk => assets.push({ ...bk, type: 'BIO', communityName: c.name, communityId: c.id }));
    c.music.forEach(m => assets.push({ ...m, type: 'SONIC', communityName: c.name, communityId: c.id }));
    return assets;
});

export const mockPendingAssets = [
    {
        id: 'pa-1',
        title: 'Traditional Bamboo Weaving technique',
        communityName: 'Warli Tribe',
        type: 'BIO',
        riskTier: 'LOW',
        description: 'A sustainable method of creating durable baskets using specifically aged local bamboo.',
        submittedDate: '2023-10-25'
    },
    {
        id: 'pa-2',
        title: 'Monsoon Chants of the Forest',
        communityName: 'Gond Community',
        type: 'SONIC',
        riskTier: 'MEDIUM',
        description: 'Audio documentation of the three-day monsoon welcoming chant.',
        submittedDate: '2023-11-02'
    }
];

export const mockLicenseRequests = [
    {
        id: 'lr-1',
        assetTitle: 'Digestive Herbal Infusion',
        communityName: 'Warli Tribe',
        applicant: 'Global Pharma Research Ltd.',
        intendedUse: 'COMMERCIAL',
        status: 'PENDING',
        requestDate: '2023-11-10',
        justification: 'We intend to research the active compounds for a new line of organic digestive aids, with profit-sharing governed by the DHAROHAR framework.'
    },
    {
        id: 'lr-2',
        assetTitle: 'Forest Water Conservation Technique',
        communityName: 'Gond Community',
        applicant: 'National Ecological Institute',
        intendedUse: 'RESEARCH_ONLY',
        status: 'PENDING',
        requestDate: '2023-11-12',
        justification: 'Academic study to document the efficacy of traditional water retention against modern climate stress.'
    }
];
