import { StarBorderOutlined, StarOutlined } from "@material-ui/icons";
import styled from "styled-components";

const Container = styled.div`
  flex: 4;
  display: flex;
  align-items: center;
`;

const RatingStars = ({ rating, fontSize }) => {
  let ratingStars;
  switch (rating) {
    case 1:
      ratingStars = (
        <Container>
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
        </Container>
      );
      break;
    case 2:
      ratingStars = (
        <Container>
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
        </Container>
      );
      break;
    case 3:
      ratingStars = (
        <Container>
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
        </Container>
      );
      break;
    case 4:
      ratingStars = (
        <Container>
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
        </Container>
      );
      break;
    case 5:
      ratingStars = (
        <Container>
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarOutlined
            style={{
              color: "#fdce0d",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
        </Container>
      );
      break;
    default:
      ratingStars = (
        <Container>
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
          <StarBorderOutlined
            style={{
              color: "lightgrey",
              fontSize: `${fontSize ? fontSize : 22}`,
            }}
          />
        </Container>
      );
      break;
  }
  return ratingStars;
};

export default RatingStars;
