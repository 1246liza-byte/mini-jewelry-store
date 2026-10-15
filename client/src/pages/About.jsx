import { useSettings } from '../context/SettingsContext';

const About = () => {
    const { settings } = useSettings();

    const storyTitle = settings?.aboutStoryTitle || 'Our Story';
    const storyParagraphs =
        settings?.aboutStoryParagraphs && settings.aboutStoryParagraphs.length
            ? settings.aboutStoryParagraphs
            : [
                "Founded with a passion for beauty and craftsmanship, Rosé & Gold began as a small atelier with a simple mission: to create jewelry that celebrates life's most precious moments. Today, we continue to honor that vision by crafting each piece with the same care and attention to detail as our very first collection.",
                'Every gemstone is hand-selected, every setting carefully designed, and every finish polished to perfection. We believe that jewelry is more than an accessory—it is a story, a memory, and a symbol of love that lasts a lifetime.',
            ];

    const valueCards =
        settings?.aboutValues && settings.aboutValues.length
            ? settings.aboutValues
            : [
                { title: 'Craftsmanship', description: 'Every piece is meticulously crafted by skilled artisans with decades of experience.', icon: '✦' },
                { title: 'Quality', description: 'We use only the finest materials, from ethically sourced gemstones to premium metals.', icon: '✦' },
                { title: 'Elegance', description: 'Our designs blend classic sophistication with contemporary style.', icon: '✦' },
                { title: 'Care', description: 'We offer lifetime care for every piece, ensuring it stays beautiful forever.', icon: '✦' },
            ];

    return (
        <div className="about-page">
            <div className="page-header">
                <div className="container">
                    <h1>About Us</h1>
                    <p>{settings?.tagline || 'Elegance in Every Detail'}</p>
                </div>
            </div>

            <div className="container page-padding">
                <div className="about-content">
                    <p className="about-lead">
                        {settings?.aboutText ||
                            'Rosé & Gold is a luxury jewelry brand dedicated to creating timeless pieces that blend elegance with modern design. Each piece is crafted with precision and passion.'}
                    </p>

                    {settings?.aboutImage && (
                        <div className="about-image">
                            <img src={settings.aboutImage} alt="About us" />
                        </div>
                    )}

                    <div className="about-story">
                        <h2>{storyTitle}</h2>
                        {storyParagraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <div className="about-values">
                        {valueCards
                            .filter((v) => v.title || v.description)
                            .map((value, index) => (
                                <div className="value-card" key={index}>
                                    <span className="value-icon">{value.icon || '✦'}</span>
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
