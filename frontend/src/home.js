
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = (props) => {
  //
  const { loggedIn, ID } = props
  //This hook returns a function called navigate, which can be used to programmatically navigate to 
  //different routes within the application. This function will be useful for redirecting the user to 
  //different pages, such as the login page or the home page, based on their interaction.
  const navigate = useNavigate()

  const onButtonClick = () => {
    if (loggedIn) {
      localStorage.removeItem('user')
      props.setLoggedIn(false)
    } else {
      navigate('/login')
    } 
  }
  

  return (
    <div className="mainContainer">
      <div className={'titleContainer'}>
        <div>Welcome!</div>
      </div>
      <div>This is the home page.</div>
      <div className={'buttonContainer'}>
        <input
          className={'inputButton'}
          type="button"
          onClick={onButtonClick}
          value={loggedIn ? 'Log out' : 'Log in'}
        />
        {loggedIn ? <div>Your ID is {ID}</div> : <div />}
      </div>
    </div>
  )
}
//Conditional Rendering: loggedIn ?

export default Home