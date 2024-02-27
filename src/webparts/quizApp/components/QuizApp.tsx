import * as React from 'react';
import styles from './QuizApp.module.scss';
import type { IQuizAppProps } from './IQuizAppProps';
import { escape } from '@microsoft/sp-lodash-subset';
import * as $ from 'jquery';
import DatePicker from "react-datepicker";
import * as moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import {SPFI, spfi} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/items/get-all";
import {Caching} from "@pnp/queryable";
import { getSP } from '../QuizAppConfig';
import { Logger } from '@pnp/logging';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap';
import 'react-bootstrap-icons';
import { HttpClient, HttpClientResponse, IHttpClientOptions } from '@microsoft/sp-http';


require('bootstrap/dist/css/bootstrap.min.css');

export interface IStates {
  extraListsURL: any;
  apiURL: any;
  CurrentUser: any;  
  message:any;
  departments:any;
  selectedDOB:any;
  endPoints:any;
  countries:any;

}


export default class QuizApp extends React.Component<IQuizAppProps, IStates> {

  private _sp:SPFI;
  isDayValid: ((date: Date) => boolean) | undefined;
  

  constructor(props: any) {
    super(props);
    this.state = {
          departments: [],
          message: '',  endPoints: [], countries:[],
          CurrentUser: null,
          extraListsURL:'',
          apiURL:'',
          selectedDOB:null
                 
     };    

     this._sp = getSP();
  

    }

    public async componentDidMount() {    

       await this._readAllEndpoints();

       await this.getCountries();
      
    }
    
    private _readAllEndpoints = async (): Promise<void> =>{
         
      try {        

             const spCache = spfi(this._sp).using(Caching({store:"session"}));

             await spCache.web.lists.getByTitle("DataLoaders").items
                .select("*")
                .getAll()
                .then((
                  results: any[])=>{
                    if(results.length>0){
                                  
                        this.setState({ endPoints:results});
                                  
                  }
                }).catch(); 
           console.log(this.state.endPoints);

      } catch (err) {
            Logger.write(JSON.stringify(err));
      }

    }

    public  getCountries = async (): Promise<void> =>{

      const URL = "https://restcountries.com/v3.1/independent?status=true";
            
      const httpClientOptions: IHttpClientOptions = {
        headers: {
          "Content-Type": "application/json"
        },
        method: "GET", 
        // mode: "no-cors", 
       }; 

       try {

        let fieldOptions  = [];	
      
        const data = await this.props.context.httpClient.get(URL, HttpClient.configurations.v1, httpClientOptions).
                      then((response: Response): Promise < HttpClientResponse >=> {
                      return response.json();
                      });
        if (!data)  console.log("Unable to fetch countries from API");

        if (data && data.length > 0) {
          for (const option of data) {        
           
              fieldOptions.push({        
                key: option.name.common,
                value:  option.name.common        
              });        
           }   
        }  
        this.setState({ countries: fieldOptions.sort() });
        console.log(fieldOptions);
        
        } 
        catch (error) {
        console.log(error);
        }


     }
      

 

 

  // private heroBackgroundStyle = {
  //    backgroundImage: 'url(' +  this.props.currentSiteURL  +"/SiteAssets/images/background.jpg" + ')'
  //   };

  

   
   

    private ViewPersonalDetailsForm(): void {
      $(".request").hide();      
      $("#dvPersonalInfo").fadeIn(1000);
    }

  private ViewQuizQuestions(): void {
    $(".request").hide();      
    $("#dvQuizQuestions").fadeIn(1000);
  }
 
  private SaveData(): void {

    $(".request").hide();      
    $("#dvResult").fadeIn(1000);

  }

  private SaveReset(): void {

    $(".request").hide();      
    $("#dvInstructions").fadeIn(1000);
    
  }

  private  ScheduleStartDate(): Date {  

    //const dateSet = moment().add(2, 'd');  		
    return moment().toDate();
  
	}

  private __onchangedSelectedDateForEmployee(date: Date | null): void {
    
     this.setState({ selectedDOB:moment(date).toDate()});
     
  }

  public render(): React.ReactElement<IQuizAppProps> {
    
    const {
      //description,
      isDarkTheme,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    
    return (
      <section className={`${styles.quizApp} ${hasTeamsContext ? styles.teams : ''}`}>

        <div className={styles.welcome} id='dvHome'>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Hi, {escape(userDisplayName)}, welcome to Reiz Quiz Test!</h2> 
          <br/>
               
          <div id='dvInstructions' className='request'>                  
              <ul className="list-group">
                  <li className="list-group-item justify-content-between align-items-center">
                  <span className="badge badge-primary badge-pill align-items-right" style= {{ backgroundColor: 'coral' }} >1</span>
                   Please input Your Personal details below
                  </li>
                  <li className="list-group-item justify-content-between align-items-center">
                  <span className="badge badge-primary badge-pill align-items-right" style= {{ backgroundColor: 'coral' }} >2</span>
                  Then answer a series of quiz questions
                   </li>
                  <li className="list-group-item justify-content-between align-items-center">
                  <span className="badge badge-primary badge-pill align-items-right" style= {{ backgroundColor: 'coral' }} >3</span>
                   Your results will be out immediately
                  </li>                 
                  
              </ul>
              <br/>
              <button type="button" className="btn btn-primary btn-lg btn-block" style= {{ backgroundColor: 'coral' }} onClick={() => this.ViewPersonalDetailsForm()}>Start Your Quiz</button>
        </div>

         <div className="form_section request" id='dvPersonalInfo' style= {{ display: 'none' }}>
								<div className="section-title">
									<h5 style={{fontFamily:'fantasy'}}>Personal Information</h5>
								</div>
               
								<div className="row align-items-center mb-5">
									<div className="col-lg-2 d-flex justify-content-end text-end">
									Name
									</div>
									<div className="col-lg-4">
										<input type="text" id='txtStaffName' className="form-control" placeholder="Enter Name"/>
									</div>
									<div className="col-lg-2 d-flex justify-content-end text-end">
										Country
									</div>
									<div className="col-lg-4">
										<select name="" id="drpCountries" className="form-select">
											<option value="">Select your country</option>
                    
											{this.state.countries.sort().map((item: { key: any; value: any; }) => {
                                                              return [
                                                              <option value={item.key}>{item.value}</option>
                                                              ];
                                             })}
										</select>
									</div>
								</div>
								<div className="row align-items-center mb-5">
									<div className="col-lg-2 d-flex justify-content-end text-end">
                      Phone Number
									</div>
									<div className="col-lg-4">
										
									<input type="text" className="form-control" id='txtHRISID' placeholder="Enter ID"/>
									</div>
									<div className="col-lg-2 d-flex justify-content-end text-end">
										Date Of Birth
									</div>
									<div className="col-lg-4">
                    <DatePicker                                
												onChange={(date) => this.__onchangedSelectedDateForEmployee(date)}
												filterDate={this.isDayValid} 												
												minDate={this.ScheduleStartDate()}
												placeholderText="Select a date" 
												className="yellow-border form-control"
												selected={this.state.selectedDOB} />
									</div>
								</div>
                <div className="row align-items-center mb-5">
									<div className="col-lg-8 d-flex justify-content-end text-end">
                     <button type="button" className="btn btn-primary btn-lg btn-block" style= {{ backgroundColor: 'coral' }} onClick={() => this.ViewQuizQuestions()}>Next</button>
                  </div>
								</div>
	</div>
        <div className="form_section request" id='dvQuizQuestions' style= {{ display: 'none' }}>
								<div className="section-title">
									<h5 style={{fontFamily:'fantasy'}}>Quiz</h5>
								</div>

                <div className="row align-items-center mb-5">
									<div className="col-lg-4 d-flex justify-content-end text-end">
						Select time Zones with Dst Saving
									</div>
									<div className="col-lg-8">
									<select name="" id="drpTimeZones" className="form-select">
											<option value="">Select your answer</option>
                    
											{
                            this.state.countries.sort().map((item: { key: any; value: any; }) => {
                            return [
                            <option value={item.key}>{item.value}</option>
                            ];
                       })}
										</select>
                   </div>
									
								</div>
               
								<div className="row align-items-center mb-5">
									
                    <div className="col-lg-4 d-flex justify-content-end text-end">
                      what day of the week is  2021-03-14 
                    </div>
									<div className="col-lg-8">
                       <input type="text" id='txtQuestion2' className="form-control" placeholder=""/>									
									</div>
								</div>
								<div className="row align-items-center mb-5">
									<div className="col-lg-4 d-flex justify-content-end text-end">
                       what day of the year is 2021-03-14
									</div>
									<div className="col-lg-8">										
							<input type="text" id='txtQuestion3' className="form-control" placeholder=""/>		
									</div>							
									
								</div>
                
                <div className="row align-items-center mb-5">
									<div className="col-lg-8 d-flex justify-content-end text-end">
                      <button type="button" className="btn btn-primary btn-lg btn-block" style= {{ backgroundColor: 'coral' }} onClick={() => this.SaveData()}>Submit</button>
                    
									</div>
								</div>
						</div>

            <div className="form_section request" id='dvResult' style= {{ display: 'none' }}>
								<div className="section-title">
									<h5 style={{fontFamily:'fantasy'}}>Quiz Result</h5>
                  </div>
								<div className="row align-items-center mb-5">
									
                    <div className="col-lg-4 d-flex justify-content-end text-end">
                     RESULT :
                    </div>
									<div className="col-lg-8">
                      <button type="button" className="btn btn-primary">
                            Pass <span className="badge badge-light">2</span>
                            <span className="sr-only"></span>
                        </button>
                  </div>
								</div>
                <div className="row align-items-center mb-5">
									<div className="col-lg-8 d-flex justify-content-end text-end">
                      <button type="button" className="btn btn-primary btn-lg btn-block"  onClick={() => this.SaveReset()}>Reset</button>
                    
									</div>						
									
								</div>

						</div>

        </div>
        
      </section>

    
    );

  }
  
 
 
  
 
}
