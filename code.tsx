// This is a widget that let's you choose teammates, randomly or by clicking on them

const { widget } = figma;
const {
  useSyncedState,
  useSyncedMap,
  usePropertyMenu,
  AutoLayout,
  Text,
  Frame,
  Image,
} = widget;

const TEST_ACTIVE_USERS = [
  { ...figma.currentUser, name: "Colleen Lawrence", id: "1" },
  { ...figma.currentUser, name: "Jon Lambert", id: "2" },
  { ...figma.currentUser, name: "Pat Adkins", id: "3" },
  { ...figma.currentUser, name: "Thomas Hines", id: "4" },
  { ...figma.currentUser, name: "Kara Hansen", id: "5" },
  { ...figma.currentUser, name: "Emmett Frank", id: "6" },
  { ...figma.currentUser, name: "Gertrude Wilkerson", id: "7" },
  { ...figma.currentUser, name: "Dorothy Ramirez", id: "8" },
  { ...figma.currentUser, name: "Courtney Taylor", id: "9" },
  { ...figma.currentUser, name: "Mohammed Rice", id: "10" },
  { ...figma.currentUser, name: "Elizabeth Lambert", id: "11" },
  { ...figma.currentUser, name: "Jacqueline Hamilton", id: "12" },
  { ...figma.currentUser, name: "Amelia Henderson", id: "13" },
  // { ...figma.currentUser, name: "Rosie Ross", id: "14" },
  // { ...figma.currentUser, name: "Charlene Pierce", id: "15" },
  // { ...figma.currentUser, name: "Horace Hayes", id: "16" },
  // { ...figma.currentUser, name: "Lee Marsh", id: "17" },
  // { ...figma.currentUser, name: "Brenda Vasquez", id: "18" },
  // { ...figma.currentUser, name: "Homer Barnes", id: "19" },
  // { ...figma.currentUser, name: "Rickey Fitzgerald", id: "20" },
];

function Button({
  text,
  textSize = 14,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke={"#2a2a2a"}
      strokeWidth={2}
      cornerRadius={100}
      padding={10}
      spacing={10}
      onClick={onClick}
    >
      <Text fill={"#2a2a2a"} fontSize={textSize}>
        {text}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubble({
  figmaUser,
  isActive = false,
  hasGone,
  onUserSelected = undefined,
}: {
  figmaUser: User;
  isActive?: boolean;
  hasGone?: number;
  onUserSelected?: (user: User) => void;
}) {
  const photoUrl = figmaUser.photoUrl;
  const teammateName = figmaUser.name;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 20 : 12;
  return (
    <AutoLayout
      direction={"horizontal"}
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={12}
      opacity={hasGone ? 0.5 : 1}
      onClick={
        isActive || hasGone > 0 || !onUserSelected
          ? undefined
          : () => {
              onUserSelected(figmaUser);
            }
      }
    >
      <AutoLayout stroke={"#2a2a2a"} cornerRadius={100}>
        {photoUrl ? (
          <Image
            cornerRadius={6}
            width={diameter}
            height={diameter}
            src={photoUrl}
          />
        ) : (
          <Frame
            cornerRadius={6}
            width={diameter}
            height={diameter}
            fill="#2A2A2A"
          />
        )}
      </AutoLayout>
      <Text
        width={textWidth}
        horizontalAlignText={"left"}
        fontSize={fontSize}
        textDecoration={hasGone > 0 ? "strikethrough" : "none"}
      >
        {isActive ? `${teammateName}, it's your turn!` : teammateName}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubbleRow({
  user1 = null,
  user2 = null,
  user3 = null,
  onUserSelected,
}: {
  key?: any;
  user1?: [User | undefined, number | undefined];
  user2?: [User | undefined, number | undefined];
  user3?: [User | undefined, number | undefined];
  onUserSelected: (user: User) => void;
}) {
  return (
    <AutoLayout
      direction={"horizontal"}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      spacing={30}
      padding={{ horizontal: 50 }}
    >
      {user1 && user1[0] ? (
        <TeammatePhotoBubble
          figmaUser={user1[0]}
          hasGone={user1[1]}
          onUserSelected={onUserSelected}
        />
      ) : null}
      {user2 && user2[0] ? (
        <TeammatePhotoBubble
          figmaUser={user2[0]}
          hasGone={user2[1]}
          onUserSelected={onUserSelected}
        />
      ) : null}
      {user3 && user3[0] ? (
        <TeammatePhotoBubble
          figmaUser={user3[0]}
          hasGone={user3[1]}
          onUserSelected={onUserSelected}
        />
      ) : null}
    </AutoLayout>
  );
}

function pickATeammate(users: Array<User>, hasGoneMap: SyncedMap<number>) {
  var eligibleTeammates = [];

  for (var i = 0; i < users.length; i++) {
    if (hasGoneMap.get(users[i].id)) {
      continue;
    } else {
      eligibleTeammates.push(users[i]);
    }
  }

  const randIdx = Math.floor(Math.random() * eligibleTeammates.length);

  return eligibleTeammates[randIdx];
}

function getFilteredUsers(users: Array<User>) {
  var filteredList = [];
  var filteredIds = new Set();
  for (var i = 0; i < users.length; i++) {
    var curr = users[i].id;
    if (!filteredIds.has(curr)) {
      filteredIds.add(curr);
      filteredList.push(users[i]);
    }
  }
  return filteredList;
}

function Widget() {
  const users = figma.activeUsers;
  //const users = TEST_ACTIVE_USERS;
  const [activeTeammate, setActive] = useSyncedState("activeTeammate", null);
  const hasGoneMap = useSyncedMap<number>("hasGone");
  const [forceRerender, setForceRerender] = useSyncedState("forceRerender", 0);
  const everyoneHasGone = users.every((user) => hasGoneMap.get(user.id));
  usePropertyMenu(
    [
      {
        tooltip: "Reset chosen people",
        propertyName: "reset",
        itemType: "action",
      },
      {
        tooltip: "Refresh list of people",
        propertyName: "refresh",
        itemType: "action",
      },
      {
        tooltip: "Undo",
        propertyName: "undo",
        itemType: "action",
      },
    ],
    (e) => {
      if (e.propertyName === "reset") {
        // reset
        hasGoneMap.keys().forEach((k) => hasGoneMap.delete(k));
        setActive(null);
      } else if (e.propertyName === "refresh") {
        // refresh
        setForceRerender(1);
      } else if (e.propertyName === "undo") {
        // undo
        var mostRecent = hasGoneMap.keys()[hasGoneMap.keys().length - 1];
        hasGoneMap.delete(mostRecent);

        // setActive to last person, null if no more
        if (hasGoneMap.keys().length == 0) {
          setActive(null);
        } else {
          // get the id of the last active person
          var newActive = hasGoneMap.keys()[hasGoneMap.keys().length - 1];

          // find the teammate with that id
          var teammate = users.find((i) => i.id === newActive);

          // set that teammate as active
          setActive(teammate);
        }
      }
    }
  );

  return (
    <AutoLayout
      direction={"vertical"}
      fill={"#FFFFFF"}
      stroke={"#E6E6E6"}
      horizontalAlignItems={"center"}
      verticalAlignItems={"center"}
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      <AutoLayout
        direction="vertical"
        spacing={20}
        horizontalAlignItems={"center"}
        padding={{ top: 0, left: 0, right: 0, bottom: 15 }}
      >
        {
          // if there's an active teammate, display else say "click the button to choose a teammate"
          !activeTeammate ? (
            <Text
              verticalAlignText="center"
              width={400}
              horizontalAlignText="center"
              fontSize={20}
            >
              Choose someone by clicking their name or click "Next" to choose
              randomly
            </Text>
          ) : (
            <TeammatePhotoBubble figmaUser={activeTeammate} isActive={true} />
          )
        }
        {everyoneHasGone && <Text fontSize={16}>Everyone has had a turn!</Text>}
        {everyoneHasGone ? (
          <Button
            text={"Start over"}
            onClick={() => {
              hasGoneMap.keys().forEach((k) => hasGoneMap.delete(k));
              setActive(null);
            }}
          />
        ) : (
          <Button
            text={"Next (random)"}
            onClick={() => {
              var chosenTeammate = pickATeammate(users, hasGoneMap);
              // update map + say this person has gone
              hasGoneMap.set(chosenTeammate.id, hasGoneMap.keys().length + 1);

              // designate which one is active
              setActive(chosenTeammate);
            }}
          />
        )}
      </AutoLayout>
      <AutoLayout direction={"vertical"} spacing={20}>
        {getFilteredUsers(users).map((user, idx, users) => {
          if (idx % 3 != 0) {
            return null;
          }
          var user1hasGone = users[idx]
            ? hasGoneMap.get(users[idx].id)
            : undefined;
          var user2hasGone = users[idx + 1]
            ? hasGoneMap.get(users[idx + 1].id)
            : undefined;
          var user3hasGone = users[idx + 2]
            ? hasGoneMap.get(users[idx + 2].id)
            : undefined;

          return (
            <TeammatePhotoBubbleRow
              key={idx}
              onUserSelected={(user) => {
                hasGoneMap.set(user.id, hasGoneMap.keys().length + 1);
                setActive(user);
              }}
              user1={[users[idx], user1hasGone]}
              user2={[users[idx + 1], user2hasGone]}
              user3={[users[idx + 2], user3hasGone]}
            />
          );
        })}
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
