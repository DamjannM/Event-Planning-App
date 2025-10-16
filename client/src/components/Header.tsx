import { Button } from "@mui/material";

type HeaderProps = {
  handleLogOut: () => void;
};

export function Header({ handleLogOut }: HeaderProps){
    return <div className="bg-white h-16 items-center absolute top-3 left-3 right-3 text-sm sm:text-base justify-between flex w-auto !p-2  rounded-2xl">
        <img src={"../public/logo.jpg"} alt="Event logo" className="h-10 w-auto" />
        <span className="text-xl font-semibold text-blue-950">Event Planner</span>
        <Button
        variant="outlined"
        size="medium"
        className="!rounded-xl h-12"
        onClick={handleLogOut}
      >
        Log Out
      </Button>
        </div>
}