import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";

interface ConfirmBoxProps {
  successText: string;
  rejectText?: string;
  onSuccess: () => void;
  open: boolean;
  onReject?: () => void;
  title: string;
  subTitle: string;
  subTitleColor?: string;
}

const ConfirmBox: React.FC<ConfirmBoxProps> = ({
  successText,
  rejectText,
  onSuccess,
  open,
  onReject,
  title,
  subTitle,
  subTitleColor,
}) => {
  return (
    <Dialog open={open} onClose={() => {}} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#1A1C23", color: "white" }}>{title}</DialogTitle>
      <DialogContent sx={{ bgcolor: "#1A1C23" }}>
        <Box component="p" sx={{ color: subTitleColor || "#9FA0A7", fontSize: "1rem" }}>
          {subTitle}
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#1A1C23", p: 2 }}>
        {rejectText && onReject && (
          <Button onClick={onReject} sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}>
            {rejectText}
          </Button>
        )}
        <Button
          onClick={onSuccess}
          variant="outlined"
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          {successText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmBox;