import { ethers } from "ethers";
import { createContext, useState, useEffect } from "react";
import { abi } from "../Utils/abi";
import { useNavigate } from 'react-router-dom';

export const EthersContext = createContext(null);
const { ethereum } = window
if(!ethereum) alert("Please install metamask to use the application")

export default function Ethers({ children }) {
  const contractAddress = "0x3e3af332c1fd7b1eb5d35c49d0f6cee46a13df40"
  const [currentAccount, setCurrentAccount] = useState(null);
  const [Stakes, setStakes] = useState();
  const [EmpWallet, setEmpWallet] = useState()
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const [Contract, setContract] = useState(new ethers.Contract(contractAddress, abi, signer))
  const navigate = useNavigate()

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getName()
      } else {
        alert("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const getEmployeeTransactions = async () => {
    try {
      const account = await getWallet()
      const contract = getContract()
      let emp = await contract.getEmployeeTransactions(account)
      return emp;
    }
    catch (e) {
      console.log(e)
    }
  }

  const getName = async () => {
    try {
      const account = await getWallet()
      const contract = getContract()
      let name = await contract.Name(account)
      return name;
    }
    catch (e) {
      console.log(e)
    }
  }
  const getEmployeeName = async (address) => {
    try {
      const contract = getContract()
      let name = await contract.Name(address)
      return name;
    }
    catch (e) {
      console.log(e)
    }
  }
  // const reqCompany = async () => {
  //   try {
  //     const account = await getWallet()
  //     const contract = getContract()
  //     let res = await contract.reqCompany(account)
  //     return res;
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  // }
  // const isEmployee = async () => {
  //   try {
  //     const account = await getWallet()
  //     const contract = getContract()
  //     let emp = await contract.isEmployee(account)
  //     console.log(emp);
  //     if (emp == 0) { navigate("/")}
  //     else if (emp == 1) navigate("/employee")
  //     else navigate('/company')
  //     return emp;
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  // }
  const createAccount = async (name) => {
      try{
        const contract = getContract()
        if(name==="") return alert("Please fill your name before sign in")
        let res = await contract.registerUser(name)
        await res.wait()
        alert("You have been succefully registerd")
        window.location.reload()
      }catch(e){
        console.log(e);
      }
  }
  // const sendJoinRequest = async (CompanyAddress) => {
  //   try {
  //     const contract = getContract()
  //     let res = await contract.sendJoinRequest(CompanyAddress)
  //     console.log(res)
  //     alert("Succefully sent the join request")
  //   }
  //   catch (e) {
  //     console.log(e)
  //     alert("Something went wrong, try again")
  //   }
  // }

  // const acceptEmployee = async (salary, empAddress) => {
  //   try {
  //     let x = ethers.utils.hexlify(salary)
  //     const contract = getContract()
  //     let res = await contract.acceptEmployee(x, empAddress)
  //     console.log(res)
  //   }
  //   catch (e) {
  //     console.log(e)
  //     alert("Something went wrong, try again")
  //   }
  // }
  // const rejectEmployee = async (empAddress) => {
  //   try {
  //     const contract = getContract()
  //     let res = await contract.acceptEmployee(empAddress)
  //     alert("Succefully rejected the application")
  //     console.log(res)
  //   }
  //   catch (e) {
  //     console.log(e)
  //     alert("Something went wrong, try again")
  //   }
  // }
  const changeEmployeeSalary = async (newSal, empAddr) => {
    try {
      const contract = getContract()
      let res = await contract.changeEmployeeSalary(newSal, empAddr)
      console.log(res)
      await res.wait()
      alert("Succefully changed the salary")
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
    }
  }

  const getCompanyTransactions = async () => {
    try {
      const account = await getWallet()
      const contract = getContract()
      let res = await contract.getCompanyTransactions(account)
      return res
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
    }
  }

  const addEmployee = async (address, salary, name) => {
    try {
      const contract = getContract()
      let res = await contract.addEmployee(salary,address)
      await res.wait()
      alert(`Succefully added ${name} with salary of ${salary} matic`)
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
    }
  }
  const removeEmployee = async (empAddr) => {
    try {
      const contract = getContract()
      let res = await contract.removeEmployee(empAddr)
      await res.wait()
      alert("Succefully removed the employee")
      window.location.reload()
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
    }
  }
  const payEmployees = async () => {
    try {
      const contract = getContract()
      const totalSal =await  calculateTotalSalary()
      let overrides = {
        value: ethers.utils.parseEther(totalSal.toString()) ,
        gasLimit: 1000000
      };
      let res = await contract.payEmployees(overrides);
      await res.wait()
      console.log(res)
      alert("Congratulations salary was distributed succefully")
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
    }
  }
  const calculateTotalSalary = async () => {
    try {
      const account = await getWallet()
      const contract = getContract()
      let res = await contract.calculateTotalSalary(account)
      res = res.div(10 ** 18 + "")
      return parseInt(res._hex, 16)
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
      return 0
    }
  }
  const getEmployeeList = async () => {
    try {
      const account = await getWallet()
      const contract = getContract()
      let res = await contract.getEmployeeList(account)
      return res
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong, try again")
    }
  }
  // const getWaitingList = async (cmpAddr) => {
  //   try {
  //     const contract = getContract()
  //     let res = await contract.getWaitingList(cmpAddr)
  //     console.log(res)
  //   }
  //   catch (e) {
  //     console.log(e)
  //     alert("Something went wrong, try again")
  //   }
  // }


  const getWallet= async()=>{
    try{
      if(currentAccount==null){
      const accounts = await ethereum.request({ method: "eth_accounts" })
      const account = accounts[0]
      return account
        }
      else return currentAccount
    }catch(e){
     alert(e)
    }
  }

  const getContract = ()=>{
    try {
      if (Contract == null) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        setContract(contract)
        return contract
      }
      else return Contract
    } catch (e) {
      alert(e)
      return null
    }
  }


  const getN = async () => {
    const chainId = 137 // Polygon Mainnet

    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: "0x89" }]
        });
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Polygon Mainnet',
                chainId: "0x89",
                nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                rpcUrls: ['https://polygon-rpc.com/']
              }
            ]
          });
        }
      }
    }

  }

  useEffect(() => {
     checkIfWalletIsConnect();
    
    getN()
  }, []);


  return (
    <EthersContext.Provider value={{ connectWallet, currentAccount, getName, checkIfWalletIsConnect, getEmployeeTransactions, createAccount, getEmployeeList, calculateTotalSalary, removeEmployee, changeEmployeeSalary, addEmployee, payEmployees, getEmployeeName, setEmpWallet, EmpWallet, getCompanyTransactions }}>
      {children}
    </EthersContext.Provider>
  )
}