import React, { useState } from 'react';
import ModalOverlay from '../ModalOverlay';
import TextArea from '../TextArea';
const AddAttributeModal = (props) => {
    const { setShowModal, personaAttributes, setPersonaAttributes } = props
    const [attribute, setAttribute] = useState('');

    const handleAddAttribute = () => {
        if (attribute) {
            if (personaAttributes.find(personaAttribute => personaAttribute.name.toLowerCase() === attribute.toLowerCase())) {
                alert('Attribute already exists')
            }
            else {
                console.log(`Adding attribute: ${attribute}`);
                setPersonaAttributes([...personaAttributes, { name: attribute, description: '' }])
                setShowModal(false);
            }
        }
    };
    return (
        <div>
            <ModalOverlay
                title="Add New Attribute"
                setShowModal={setShowModal}
                footerButtonLabel="Done"
                onFooterButtonClick={handleAddAttribute}
            >
                <TextArea
                    attribute={attribute}
                    placeholder={"Example: gender, age, personality, occupation, desire, goal, trauma, hobby, tone, etc"}
                    onChange={(e) => setAttribute(e.target.value)}
                    styles={styles}
                >
                </TextArea>

            </ModalOverlay>
        </div>
    );
};

const styles = {
    description: {
        width: '100%',
        padding: '10px',
        fontSize: 'var(--font-small)',
        borderRadius: '5px',
        border: '1px solid black',
        marginBottom: '10px',
        resize: 'vertical',  // Allow resizing vertically
        whiteSpace: 'pre-wrap', // Make sure line breaks are supported in the text
        overflowWrap: 'break-word', // Break long words if necessary
        overflow: 'hidden'
    },
};

export default AddAttributeModal;
