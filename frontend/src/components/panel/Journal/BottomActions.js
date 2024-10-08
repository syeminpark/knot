import { act, useEffect, useState } from "react";
import SelectBox from "../../SelectBox";
import TabNavigation from "../Character/TabNavigation";
import ToggleButton from "../../ToggleButton"
import WriteCommentInput from "./WriteCommentInput";
import apiRequest from "../../../utility/apiRequest";
import { v4 as uuidv4 } from 'uuid';
import { getJournalsByCharacterUUID } from "./journalBookReducer";
import { useTranslation } from 'react-i18next';

const BottomActions = (props) => {
    const { t } = useTranslation();
    const { selectedCharacters, setSelectedCharacters, createdCharacters, dispatchCreatedJournalBooks, selectedBookAndJournalEntry, setLoading, onNewComment } = props
    const [commentValue, setCommentValue] = useState("");
    const [activeTab, setActiveTab] = useState('SYSTEMGENERATE');
    const [isMultipleSelect, setIsMultipleSelect] = useState(true);
    const [commentPlaceholder, setCommentPlaceholder] = useState("");
    const [isExpanded, setIsExpanded] = useState(true);
    const { bookInfo, journalEntry } = selectedBookAndJournalEntry;

    const tabs = [
        { key: 'SYSTEMGENERATE', label: t('SYSTEMGENERATE') },
        { key: 'MANUALPOST', label: t('MANUALPOST') },
    ];


    const onSendButtonClick = async () => {
        if (selectedCharacters.length < 1) {
            alert(t('selectACharacter'));
        } else if (!commentValue && activeTab === "MANUALPOST") {
            alert(t('pleaseWriteContent'));
        } else {
            if (activeTab === "MANUALPOST") {
                selectedCharacters.forEach(selectedCharacter =>
                    selectedCharacter.content = commentValue
                );
            } else {
                try {
                    setLoading(true);
                    const uuids = selectedCharacters.map(character => character.uuid);
                    const response = await apiRequest('/createLLMComments', 'POST', {
                        journalEntryUUID: journalEntry.uuid,
                        characterUUIDs: uuids
                    });

                    response.comments.forEach((object, index) => {
                        const character = selectedCharacters.find(selectedCharacter =>
                            selectedCharacter.uuid === object.characterUUID
                        );
                        if (character) {
                            character.content = object.generation;
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            }

            // Prepare the payload for the API request
            const comments = selectedCharacters.map((selectedCharacter) => ({
                journalEntryUUID: journalEntry.uuid,
                ownerUUID: selectedCharacter.uuid,
                content: selectedCharacter.content,
                selectedMode: activeTab,
                commentThreadUUID: uuidv4(),
                commentUUID: uuidv4(),
                createdAt: Date.now()
            }));

            // Dispatch each comment individually
            comments.forEach((newComment) => {
                console.log(newComment, bookInfo.uuid);

                // Dispatch individual comment action
                dispatchCreatedJournalBooks({
                    type: 'CREATE_COMMENT',
                    payload: {
                        ...newComment,
                        journalBookUUID: bookInfo.uuid,
                    },
                });
            });
            setCommentValue(''); // Reset comment value after submitting
            if (comments.length > 0) {
                const lastCommentUUID = comments[comments.length - 1].commentUUID;
                onNewComment(lastCommentUUID);
            }

            // Now send the API request with the constructed payload
            const payload = {
                journalBookUUID: bookInfo.uuid,
                journalEntryUUID: journalEntry.uuid,
                comments
            };


            try {
                const response = await apiRequest('/createComments', 'POST', payload);
                console.log(response);
            } catch (error) {
                console.error('Error creating comments:', error);
            } finally {

                setLoading(false);
            }
        }
    };


    // useEffect(() => {
    //     if (activeTab === "MANUALPOST") {
    //         setIsMultipleSelect(false);
    //     } else {
    //         setIsMultipleSelect(true);
    //     }
    // }, [activeTab]);

    // useEffect(() => {
    //     setActiveTab(t('systemgenerate'));
    // }, [t]);

    useEffect(() => {
        if (selectedCharacters.length > 0) {
            const characterNames = selectedCharacters
                .map(character => `'${character.name}'`) // Add single quotes around each name
                .join(', ');
            setCommentPlaceholder(t('writeCommentAs', { characterNames }));
        }

    }, [selectedCharacters]);

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div>
            {/* Clickable Header */}
            <div style={styles.headerContainer} onClick={toggleExpand}>
                <div style={styles.commentTitle}>
                    {t('newCommentThread')}
                </div>
                <ToggleButton
                    expandable={true}
                    expanded={isExpanded}
                    direction={isExpanded ? "up" : "down"}
                    size="small"
                />
            </div>

            {/* Show content only when expanded */}
            {isExpanded && (
                <>
                    {/* Tab Navigation */}
                    <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Character Select - Always visible */}
                    <div style={styles.characterSelect}>
                        <SelectBox
                            selectedCharacters={selectedCharacters}
                            setSelectedCharacters={setSelectedCharacters}
                            availableCharacters={createdCharacters.characters.filter(character => character.uuid !== journalEntry.ownerUUID)}
                            multipleSelect={isMultipleSelect}
                        />
                    </div>

                    {/* Only render Generate button or Comment input if characters are selected */}
                    {selectedCharacters.length > 0 && (
                        <>
                            {/* Generate Mode */}
                            {activeTab === 'SYSTEMGENERATE' && (
                                <div style={styles.generateButtonContainer}>
                                    <button style={styles.generateButton} onClick={onSendButtonClick}>✨ {t('generate')}</button>
                                </div>
                            )}

                            {/* Manual Mode */}
                            {activeTab === 'MANUALPOST' && (
                                <div style={styles.commentInputContainer}>
                                    <WriteCommentInput
                                        placeholder={commentPlaceholder}
                                        commentValue={commentValue}
                                        setCommentValue={setCommentValue}
                                        sendButtonCallback={onSendButtonClick}
                                    >
                                    </WriteCommentInput>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    headerContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        marginBottom: '5px',

    },
    commentTitle: {
        fontSize: 'var(--font-small)',
        fontWeight: 'var(--font-bold)',
    },
    characterSelect: {
        marginBottom: '10px',

    },
    generateButtonContainer: {
        textAlign: 'center',
    },
    generateButton: {
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        cursor: 'pointer',
        width: '100%',
    },
    commentInputContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        marginTop: '10px',
        width: '100%',
    },

};

export default BottomActions;
