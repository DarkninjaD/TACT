// components
import ExerciseInfo from "./ExerciseInfoPg1"
import YourPlan from "./AircraftInfoPg2"
import PickAddOns from "./AirfareInfoPg3"
import Lodging from "./PlanningToolPg4"
import Thanks from "./PlanningToolPg5"
import StepInformations from "./StepInformations"

//styles
import '../../styles/PlanningTool.css'

// hooks
import { useEffect, useState } from "react"
import { texts } from "../../hooks/texts"
import { useForm } from "../../hooks/useForm"
import TactApi from "../../api/TactApi"

// --------- planning layout ------------
//pg 1 (ex Info) -> drop down with made ex's, user name and unit
//pg 2 (Aircraft) -> Amount of aircraft + personnel attached .... list or table
//pg 3 (airfair) -> api needs dates and location ---- steal for unit info
//pg 4 (lodging) -> perdiem api used with total personnel
//pg 5 (meals) -> ^^ above but if meals provided

// find where to join unit exercise db with used aircraft db for calculations


const unitExerciseTemplate = {
    unitExerciseID: undefined,
    exerciseID: undefined, //set from drop down of High level exercise
    status: false, // Should be an enum = 'Draft' | "Complete"
    dateCreated: new Date(),
    locationFrom: undefined, //to be used with api for airfair
    locationTo: undefined,
    travelStartDate: new Date(), //should start with the exercise dates, but user modifiable
    travelEndDate: new Date(),
    unit: undefined,       //exercise info (default to current user)
    userID: -1,    //pull from current user
    personnelSum: 0, //calculated from total aircraft
    unitCostSum: 0 //^^
}

function PlanningTool(props) {
    const { user } = props;
    const [data, setData] = useState(unitExerciseTemplate);
    const [userInfo, setUserInfo] = useState();
    const [saved, setSaved] = useState({saved: false, alert: 'Nothing Selected'});

    const userEmail = user ? user.email : "admin@gmail.com";
    //TODO: The userID should be passed from main application, 
    //this needs to be updated once that is figured out
    const fetchUserInfo = async () => {
        const response = await TactApi.getUser(userEmail);
        setUserInfo(response);
    };

    useEffect(() => {
        fetchUserInfo()
    }, []);

    useEffect(() => {
        userInfo && updateFileHandler({
            unit: userInfo.unit,
            userID: userInfo.userID
        })
    }, [userInfo]);

    useEffect(() => {
        console.log('useEffect data', data);
    }, [data]);

    //creates new mission in the DB with 'newMission' as the data obj 
    const createUnitExercise = async (newMission) => {
        const response = await TactApi.saveUnitExercise(newMission);
        setData(response);
        setSaved({saved: true});
    }

    const updateUnitExercise = async () => {
        await TactApi.updateUnitExercise(data)
            .catch((err) => {console.log(err)});
        setSaved({saved: true});       
    }

    const { arrayInformationsStep } = texts()

    const updateFileHandler = (update) => {
        if (Object.keys(update).includes('exerciseID')) {
            //validate if there is an existing mission with that exId
            //if yes, then update the current 'data' with the db data
            //if no, then create a newmission
            const temp = data;
            temp.exerciseID = update.exerciseID;
            createUnitExercise(temp);
;        } else {
            setSaved({saved: false, alert: 'Saving Inputs'})
            const temp = data;
            Object.keys(update).forEach((obj) => {
                temp[obj] = update[obj];
            });
            setData(temp);
            if (data.unitExerciseID) {
                updateUnitExercise();
            } else {
                setSaved({saved: false, alert: 'Must Select an Exercise'})
            }
        }
       }

    // get the pages of the steps
    //TODO set up the setSave on each of the pages
    const formComponents = [
        <ExerciseInfo data={data} updateFileHandler={updateFileHandler} setSaved={setSaved}/>,
        <YourPlan data={data} updateFileHandler={updateFileHandler} setSaved={setSaved}/>,
        <PickAddOns data={data} updateFileHandler={updateFileHandler} setSaved={setSaved}/>,
        <Lodging data={data} updateFileHandler={updateFileHandler} setSaved={setSaved}/>,
        <Thanks />
    ]

    const { currentStep, currentComponent, changeStep, isFarstStep} = useForm(formComponents, data, saved)

    // to keep the 'Next Step' button in the same place
    const styleToActions = isFarstStep ? 'end' : 'space-between'
    const isThankyouStep = currentStep === formComponents.length - 1 ? 'center' : 'space-between'
    const displayOff = currentStep !== formComponents.length - 1 ? 'flex' : 'none'
    const lastNumber = formComponents.length + 1;

    // DeltaFox: This code was grabbed from this site: https://www.frontendmentor.io/solutions/multistep-form-isMXbZc7cy.  You can go there to see the intended functionality and original source code.
    return (
        <div>
            <main className="main-container">
                <aside>
                    <div className='step-background'>
                        <div className="step-bar">
                            {arrayInformationsStep.map(step => 
                                <StepInformations 
                                    key={step.num}
                                    array={step}
                                    step={currentStep} 
                                    lastNumber={lastNumber}
                                />
                            )}
                        </div>
                    </div>
                </aside>

                <div className="header-and-form-container">
                    {/* <div className="header-container">
                        <h1>
                            {currentStep + 1 >= formComponents.length ? null : headerText[currentStep].h1}
                        </h1>

                        <p>
                            {currentStep + 1 >= formComponents.length ? null : headerText[currentStep].p}
                        </p>
                    </div> */}
                    <form onSubmit={(e) => changeStep(currentStep + 1, e)} className='form' style={{ justifyContent: isThankyouStep }}>
                        <div className="inputs-container">{currentComponent}</div>
                        <div className="actions" style={{ justifyContent: styleToActions, display: displayOff }}>
                            {!isFarstStep && currentStep !== formComponents.length - 1 ? (
                                <button
                                    type="button"
                                    className="btn-go-back"
                                    onClick={() => changeStep(currentStep - 1)}
                                >
                                    <span>Go Back</span>
                                </button>
                            ) : ''}

                            {currentStep < formComponents.length - 2 ? (
                                <button type="submit" className="btn-next-step">
                                    <span>Next Step</span>
                                </button>
                            ) : (
                                <button type="submit" className="btn-confirm">
                                    <span>Confirm</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>

            {/* <footer>
                <p className="attribution">
                    Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend Mentor</a>.
                    Coded by <a href="#">Your Name Here</a>.
                </p>
            </footer> */}
            <div className="bottom-space"></div>
        </div>
    )
}

export default PlanningTool