import BasePanel from '../BasePanel';
import { useState } from 'react';
import CreateJournalModal from './CreateJournalModal';
import Feed from './Feed';

const JournalPanel = (props) => {
    const { id, panels, setPanels, createdCharacters, setCreatedCharacters, createdJournalBooks, setCreatedJournalBooks } = props;
    const [showModal, setShowModal] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null)

    const onCreateNewJournalBook = () => {
        setShowModal(true);
    };

    return (
        <BasePanel
            id={id}
            panels={panels}
            setPanels={setPanels}
            title="Journal"
            iconStyles="journal-icon"
        >
            {/* Create New Journal Book Button */}
            <div style={styles.stickyButtonContainer}>
                <button style={styles.createJournalBtn} onClick={onCreateNewJournalBook}>
                    <i className="icon">+</i> Create New Journal
                </button>
            </div>

            {showModal && (
                <CreateJournalModal
                    setShowModal={setShowModal}
                    createdCharacters={createdCharacters}
                    createdJournalBooks={createdJournalBooks}
                    setCreatedJournalBooks={setCreatedJournalBooks}
                />
            )}

            {selectedJournal === null ? (
                <Feed
                    createdJournalBooks={createdJournalBooks}
                    createdCharacters={createdCharacters}
                    panels={panels}
                    setPanels={setPanels}
                    setSelectedJournal={setSelectedJournal}
                ></Feed>
            ) : (
                <div>


                </div>
            )}
        </BasePanel>
    );
};

//new JournalHistory
/*
let newJournalBook = {
id: uuidv4(),
journalPrompt: journalPrompt,
selectedMode: selectedMode,
createdAt: Date.now(),
selectedCharacters: selectedCharacters,
journalEntries: selectedCharacters.map(characterName => (
    {id: uuidv4(), 
     ownerName:
     content: journalEntry,
     commentThreads:[{
        index: 
        createdAt: Date.now(),
        conversationHistory:[{ 
            index:
            characterName:
            text:
            type:
            createdAt: Date.now(),
            },
            { 
            index:
            text:
            type:
            characterName:
            createdAt: Date.now(),
            },
            ]
        }]
    }))
};

``
*/







const styles = {
    stickyButtonContainer: {
        position: 'sticky',
        zIndex: 10,
        backgroundColor: 'white',
    },
    createJournalBtn: {
        display: 'block',
        backgroundColor: '#6c63ff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 0',
        fontSize: '16px',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
};

export default JournalPanel;
