
import CharacterButton from './CharacterButton';
import openNewPanel from './openNewPanel';
import { useEffect, useState } from 'react'

const SidebarRight = (props) => {
    const { panels, setPanels, createdCharacters } = props



    return (
        <div className="sidebarRight">
            <h3 className="sidebarRight-title">Characters</h3>

            <span className="sidebarRight-subtitle"> Online - {createdCharacters.characters.length}</span>
            <div className="character-list">
                {/* Render all Attribute components for each selected character */}
                {createdCharacters.characters.length > 0 && (
                    createdCharacters.characters.map((character) => (
                        <button key={character.uuid} className="character-item" onClick={() => { openNewPanel(panels, setPanels, 'character-profile', character) }}>
                            <CharacterButton
                                panels={panels}
                                setPanels={setPanels}
                                createdCharacter={character}
                            ></CharacterButton>
                        </button>
                    ))
                )}
            </div>
            <div className="buttonContainer">
                <button className="create-button" onClick={() => { openNewPanel(panels, setPanels, "character-creation") }}>
                    <span className="icon">+</span> Create
                </button>
            </div>
        </div >
    )
}
export default SidebarRight

