import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from "lodash";
import { theme } from '../theme'; // Import theme configurations
import { fetchLocations, fetchWeatherForecast } from '../api/weather'; // Import API functions
import * as Progress from 'react-native-progress'; // Progress indicator component
import { StatusBar } from 'expo-status-bar'; // StatusBar component from Expo
import { weatherImages } from '../constants'; // Images related to weather conditions
import { getData, storeData } from '../utils/asyncStorage'; // Utility functions for handling async storage

export default function HomeScreen() {
  //  variables for component's behavior 
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({})

// Function to handle search 
const handleSearch = search=>{
 // console.log('value: ',search);
 if(search && search.length>2)
fetchLocations({cityName: search}).then(data=>{
 // console.log('got locations: ',data);
 setLocations(data);
 })
  }

  // Function to handle  weather forecast
  const handleLocation = loc=>{
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
    }).then(data=>{
      setLoading(false);
      setWeather(data);
      storeData('city',loc.name);
    })
  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Kottawa';
    if(myCity){
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
    }).then(data=>{
      // console.log('got data: ',data.forecast.forecastday);
      setWeather(data);
      setLoading(false);
    })
    
  }

  //funtion to avoid continuous API calls
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {location, current} = weather;

  return (
    // Main container View for the Home Screen
    <View className="flex-1 relative">
      <StatusBar style="light" />

{/* Background Image */}
 <Image 
 source={require('../assets/images/background.png')} 
 className="absolute w-full h-full" />
 {
  loading? (
  <View className="flex-1 flex-row justify-center items-center">
 <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
 </View>
 ):(
 <SafeAreaView className="flex flex-1">
  {/* search section */}
 <View style={{height: '7%'}} className="mx-4 relative z-50">
   <View 
  className="flex-row justify-end items-center rounded-full" 
 style={{backgroundColor: showSearch? theme.bgWhite(0.2): 'transparent'}}>
                  
   {
showSearch? (
 <TextInput 
onChangeText={handleTextDebounce} 
 placeholder="Search city" 
  placeholderTextColor={'lightgray'} 
  className="pl-6 h-10 pb-1 flex-1 text-base text-white" />
 ):null
 }
<TouchableOpacity

  onPress={() => toggleSearch(!showSearch)}
  className="rounded-full p-3 m-1"
  style={{ backgroundColor: theme.bgWhite(0.3) }}
>
 {

 showSearch? (
  <XMarkIcon size="20" color="white" />
 ):(
  <MagnifyingGlassIcon size="20" color="white" />
  )
 }
                      
</TouchableOpacity>
  </View>
  {


 // Display search results 
 locations.length>0 && showSearch?(
 <View className="absolute w-full bg-gray-300 top-16 rounded-3xl ">
  {
   locations.map((loc, index)=>{
  let showBorder = index+1 != locations.length;
 let borderClass = showBorder? ' border-b-2 border-b-gray-400':'';
  return (

 <TouchableOpacity 
 key={index}
 onPress={()=> handleLocation(loc)} 
  className={"flex-row items-center border-0 p-3 px-4 mb-1 "+borderClass}>
 <MapPinIcon size="20" color="gray" />
 <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
</TouchableOpacity>
  )
 })
}
  </View>
  ):null
  }
                
</View>


 {/* forecast section */}
<View className="mx-4 flex justify-around flex-1 mb-2">

 {/* to display location */}
 <Text className="text-white text-center text-2xl font-bold">
 {location?.name}, 
 <Text className="text-lg font-semibold text-white-300">{location?.country}</Text>
</Text>

  {/*  to display weather image */}
 <View className="flex-row justify-center">
  <Image 
  //source={{uri: 'https:'+current?.condition?.icon}} 
 source={weatherImages[current?.condition?.text || 'other']} 
 className="w-52 h-52" />           
 </View>

 {/* to display temperature */}
 <View className="space-y-2">
  <Text className="text-center font-bold text-white text-6xl ml-5">
 {current?.temp_c}&#176;
</Text>
  <Text className="text-center text-white text-xl tracking-widest">
 {current?.condition?.text}
  </Text>
  </View>

  {/* Display other weather statistics */}
  <View className="flex-row justify-between mx-4">

  
  {/* Display speed of wind */}
    <View className="flex-row space-x-2 items-center">
   <Image source={require('../assets/icons/wind.png')} className="w-6 h-6" />
      <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
       </View>

        {/* Display humidity percentage */}
         <View className="flex-row space-x-2 items-center">
          <Image source={require('../assets/icons/drop.png')} className="w-6 h-6" />
            <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
           </View>

       {/* Display time of sunrise */}
          <View className="flex-row space-x-2 items-center">
           <Image source={require('../assets/icons/sun.png')} className="w-6 h-6" />
           <Text className="text-white font-semibold text-base">
              { weather?.forecast?.forecastday[0]?.astro?.sunrise }

  </Text>
 </View>
                  
</View>
</View>

 
</SafeAreaView>
  )
  }
  
    </View>
  )
}
