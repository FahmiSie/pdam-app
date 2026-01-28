import { getCookie } from "cookies-next";


export interface Root {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  id: number
  user_id: number
  name: string
  phone: string
  owner_token: string
  createdAt: string
  updatedAt: string
  user: User
}

export interface User {
  id: number
  username: string
  password: string
  role: string
  owner_token: string
  createdAt: string
  updatedAt: string
}


async function getAdminProfile(): Promise<Data | null> {
    try {
       const token = getCookie("accessToken")
       const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/me`
       
       console.log("Fetching admin profile from:", url)
       console.log("Token exists:", !!token)
       
       const response = await fetch(url, {
            method: `GET`,
            headers: {
                "APP-KEY": `${process.env.NEXT_PUBLIC_APP_KEY || ""}`,
                "Authorization": `Bearer ${token}`,
            }
        })

        const responseData: Root =
        await response.json();
        
        console.log("API Response Status:", response.status)
        console.log("API Response:", responseData)
        
         if(!response.ok){
            console.log("Error:", responseData.message)
            return null
         }
         return responseData.data
    } catch (error) {
        console.log("Fetch error:", error)
        return null
    }
}

export default async function DashboardAdminPage() {
    const adminData = await getAdminProfile()
    if(adminData == null){
        return(
             <div className="w-full p-5">
            Sorry, admin does not exists
        </div>
        )
    }

    return (
        <div className="w-full p-5">
            <div className="w-full p-5 bg-sky-50 rounded">
                <h1 className="font-bold text-sky-500 text-xl">
                    Admmin Profile
                    </h1>
                    <table>
                        <tbody>
                            <tr>
                                <td className="p-2">Name</td>
                                <td className="p-2">{adminData.name}</td>
                                </tr>
                                <tr>
                                <td className="p-2">Name</td>
                                <td className="p-2">{adminData.user.username}</td>
                                </tr>
                                <tr>
                                <td className="p-2">Name</td>
                                <td className="p-2">{adminData.phone}</td>
                                </tr>
                        </tbody>
                    </table>
                    </div>
                    </div>
    )
}