import { useState } from 'react';
import ModalOverlay from '../ModalOverlay';
import TextArea from '../TextArea';
import CharacterButton from '../CharacterButton';
import { useTranslation } from 'react-i18next';
import ToggleButton from '../ToggleButton';
import apiRequest from '../../utility/apiRequest';
import Loading from '../Loading';
import { v4 as uuidv4 } from 'uuid';
import { connected } from 'process';

const DiscoverCharacterModal = ({ setShowModal, onDiscover, currentCharacter, setConnectedCharacters }) => {
    const { t } = useTranslation();
    const [textDescription, setTextDescription] = useState('');
    const [stage, setStage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [generatedCharacters, setGeneratedCharacters] = useState([]);
    const [personaAttributes, setPersonaAttributes] = useState([]);
    const [showAttributes, setShowAttributes] = useState({});
    const [addedCharacters, setAddedCharacters] = useState({});



    const transformToAttributes = (character) => {
        const personaAttributes = [];
        const connectedCharacters = [];
        let your_relationship;

        for (const attribute in character?.attributes) {
            const attrValue = character.attributes[attribute];

            if (attrValue && typeof attrValue === 'object' && attrValue?.description) {
                if (attribute === "my_relationship") {
                    connectedCharacters.push({
                        name: currentCharacter.name,
                        description: attrValue.description,
                        uuid: currentCharacter.uuid,
                    });
                } else if (attribute === "your_relationship") {
                    your_relationship = attrValue.description;
                    // You may want to use this `your_relationship` to create the relationship
                } else {
                    personaAttributes.push({
                        name: attribute,
                        description: attrValue.description,
                    });
                }
            }
        }

        return { personaAttributes, connectedCharacters, your_relationship };
    };
    console.log(currentCharacter)

    const handleDiscover = async () => {
        setLoading(true);
        setStage(1);
        let tempConnectedCharacters = [];

        try {
            const payload = {
                characterUUID: currentCharacter?.uuid,
                content: textDescription,
            };

            const LLMResponse = await apiRequest("/createLLMStranger", 'POST', payload);
            const characterObject = JSON.parse(LLMResponse?.generation);

            // 캐릭터 정보 저장 및 personaAttributes 업데이트
            setGeneratedCharacters(characterObject?.characters);

            // Persona Attributes 상태 업데이트
            const { personaAttributes } = transformToAttributes(characterObject?.characters?.[0]);
            setPersonaAttributes(personaAttributes);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

const processCharacters = async (character, currentCharacter, setConnectedCharacters) => {
    let tempConnectedCharacters = [];

    const { connectedCharacters, your_relationship } = transformToAttributes(character);
    const uuid = uuidv4();

    const createPayload = {
        uuid: uuid,
        name: character?.name,
        personaAttributes: personaAttributes,
        connectedCharacters: connectedCharacters,
    };

    await apiRequest("/createCharacter", 'POST', createPayload);

    // Collect connected characters
    if (your_relationship) {
        tempConnectedCharacters.push({
            name: character?.name,
            description: your_relationship,
            uuid: uuid,
        });
    }

    // Update connected characters
    setConnectedCharacters((prevCharacters) => [...prevCharacters, ...tempConnectedCharacters]);
};

    const toggleAttributes = (index) => {
        setShowAttributes((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };


    const footerButtonLabel = t('find');
    const onFooterButtonClick = loading ? null : handleDiscover;


    return (
        <ModalOverlay
            title={t('discoverCharacter')}
            setShowModal={setShowModal}
        >
            {/* TextArea 및 CharacterButton 부분 */}
            {(stage === 0 || stage === 1) && (
                <>
                    <div style={styles.resultsContainer}>
                        <div style={styles.characterProfiles}>
                            <div>
                                <CharacterButton createdCharacter={currentCharacter} />
                            </div>
                            <div>
                                <span style={styles.arrow}>⇄</span>
                            </div>
                            <div>
                                <CharacterButton
                                    createdCharacter={{
                                        name: '?',
                                        profilePicture: null,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <TextArea
                        attribute={{ description: textDescription }}
                        placeholder={t('relationships')}
                        onChange={(e) => setTextDescription(e.target.value)}
                        styles={styles}
                        label={t('association')}
                    />
    
                    <div style={styles.modalFooter}>
                        <button
                            style={styles.footerButton}
                            onClick={onFooterButtonClick}
                            disabled={loading}
                        >
                            {footerButtonLabel}
                        </button>
                    </div>
                    
                    <div>
                        {loading && <Loading />}
                    </div>
                </>
            )}
    
            {/* 생성된 캐릭터 목록 */}
            {stage === 1 && generatedCharacters?.length > 0 && (
                <>
                    {generatedCharacters?.map((character, index) => {
                    const attributeLabelMap = {
                        Backstory: '배경',
                        my_relationship: `${character.name} ➡️ ${currentCharacter.name}`,
                        your_relationship: `${currentCharacter.name} ➡️ ${character.name}`,
                    };

                    return (
                        <div key={index} style={styles.characterCard}>
                            <div style={styles.sectionHeader}>
                                <CharacterButton createdCharacter={character} />
                                <button
                                    style={addedCharacters[index] ? styles.plusButtonDisabled : styles.plusButton} // 상태에 따라 스타일 적용
                                    onClick={() => {
                                        processCharacters(character, currentCharacter, setConnectedCharacters);
                                        setAddedCharacters((prev) => ({ ...prev, [index]: true })); // 추가 상태 업데이트
                                        console.log(`Character ${character.name} added`);
                                    }}
                                    disabled={addedCharacters[index]} // 추가된 캐릭터라면 버튼 비활성화
                                >
                                    {addedCharacters[index] ? "✔️ 추가됨" : "+ 추가"} {/* 상태에 따라 버튼 텍스트 변경 */}
                                </button>
                            </div>

                            {/* 토글 버튼 */}
                            <button
                                style={styles.toggleButton}
                                onClick={() => toggleAttributes(index)}
                            >
                                {showAttributes[index] ? "▲ 닫기" : "▼ 더보기"}
                            </button>

                            {/* 속성 리스트 */}
                            {showAttributes[index] && (
                                <div style={styles.characterInfo}>
                                    {character.attributes && Object.keys(character.attributes).length > 0 ? (
                                        <ul style={styles.personaAttributesList}>
                                            {Object.keys(character.attributes).map((attrKey, idx) => (
                                                <li key={idx} style={styles.personaAttributeItem}>
                                                    <strong>
                                                        {attributeLabelMap[attrKey] || attrKey}: {/* 매핑된 이름을 사용하거나 기본 키 사용 */}
                                                    </strong> 
                                                    {character.attributes[attrKey].description || 'N/A'}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>{t('noAttributesFound')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}


                </>
            )}
        </ModalOverlay>
    );
    
    
};

const styles = {
    description: {
        width: '100%',
        minHeight: '70px',
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: 'white',
        fontSize: 'var(--font-small)',
        resize: 'vertical',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
        border: '1px solid #b8b8f3',
    },
    resultsContainer: {
        marginTop: '20px',
        marginBottom: '20px',
    },
    personaAttributesList: {
        listStyleType: 'none',
        padding: 0,
    },
    personaAttributeItem: {
        marginBottom: '10px',
    },
    characterProfiles: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
    },
    arrow: {
        fontSize: '24px',
        color: '#333',
        marginRight: '5px',
    },
    resultBox: {
        marginTop: '20px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '10px',
        textAlign: 'center',
    },
    textAreaContainer: {},
    textAreaLabel: {
        display: 'block',
        color: '#6d6dff',
        fontSize: 'var(--font-medium)',
        fontWeight: 'var(--font-bold)',
        marginBottom: '10px',
    },
    regenerateButtonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20px', // Optional: Add margin to separate from other elements
    },
    regenerateButton: {
        // backgroundColor: 'var(--color-secondary)',
        backgroundColor: 'black',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: 'var(--font-medium)',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: '10px',
    },
    sectionHeaderLabel: {
        color: '#6d6dff',
        fontSize: 'var(--font-medium)',
        fontWeight: 'var(--font-bold)',
        marginLeft: '10px', // Ensure some spacing between the character button and the name
    },
    characterCard: {
        backgroundColor: 'var(--color-bg-grey)', // Match the background color of Attribute
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '12px',
        boxShadow: '0 4px 4px rgba(196, 196, 196, 0.25)',
    },
    characterInfo: {
        display: 'block',
        paddingLeft: '10px',
    },
    personaAttributesList: {
        listStyleType: 'none',
        padding: 0,
    },
    personaAttributeItem: {
        marginBottom: '10px',
    },
    plusButton: {
        fontSize: '16px', // Adjust font size
        padding: '8px 16px', // Add padding to make it button-like
        cursor: 'pointer',
        color: 'white', // Text color
        backgroundColor: '#6d6dff', // Background color of the button
        border: 'none', // Remove default border
        borderRadius: '5px', // Slightly round the corners
        marginLeft: '10px',
        transition: 'background-color 0.3s ease', // Add a hover transition
    },
    plusButtonHover: {
        backgroundColor: '#5757d1', // Darken the color on hover
    },
    plusButtonDisabled: {
        fontSize: '16px',
        padding: '8px 16px',
        color: 'gray',
        backgroundColor: '#e0e0e0',
        border: 'none',
        borderRadius: '5px',
        marginLeft: '10px',
        transition: 'background-color 0.3s ease',
    },    
    footerButton: {
        backgroundColor: 'black',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: 'var(--font-medium)',
    },
    modalFooter: {
        textAlign: 'center',
        margin: '10px',
    },
    toggleButton: {
        padding: '5px 10px',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
    },
};

export default DiscoverCharacterModal;

