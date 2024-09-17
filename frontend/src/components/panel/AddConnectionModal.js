import { useState, useEffect } from 'react';
import ModalOverlay from '../ModalOverlay';
import SelectBox from '../SelectBox';

const AddConnectionModal = (props) => {
    const { setShowModal, connectedCharacters, setConnectedCharacters, createdCharacters, caller } = props;
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    console.log('caller', caller, createdCharacters)
    const handleAddConnection = () => {
        if (selectedCharacters.length > 0) {
            let temp = []
            for (let character of selectedCharacters) {
                temp.push({ name: character.name, description: '', uuid: character.uuid })
                console.log(temp)
            }
            setConnectedCharacters([...connectedCharacters, ...temp])
            setShowModal(false);
        }
    };



    return (
        <div>
            <ModalOverlay
                title="Add New Connection"
                setShowModal={setShowModal}
                footerButtonLabel="Add"
                onFooterButtonClick={handleAddConnection}
                isFooterButtonDisabled={selectedCharacters.length === 0}
            >
                <SelectBox
                    selectedCharacters={selectedCharacters}
                    setSelectedCharacters={setSelectedCharacters}
                    createdCharacters={createdCharacters.filter(createdCharacter =>
                        !connectedCharacters.some(connectedCharacter =>
                            connectedCharacter.uuid === createdCharacter.uuid
                        ) && (caller?.uuid ? createdCharacter.uuid !== caller.uuid : true))}

                >
                </SelectBox>
            </ModalOverlay>
        </div >
    );
};



export default AddConnectionModal;